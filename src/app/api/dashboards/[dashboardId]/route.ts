import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

///////////////////////////////////////////////////////////
//UPDATE A DASHBOARD

interface PUTRequestBody{
  title?: string;
  description?: string;
  isPublic?: boolean;
  tagIds?: number[];
}

interface PUTResponse{
  success: boolean;
  message: string;
  dashboardId: string | null;
}

export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ dashboardId: string }> })
  : Promise<NextResponse<PUTResponse>>{
  
  const { dashboardId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id){
    return NextResponse.json<PUTResponse>(
      { success: false, 
        message: "Unauthorized", 
        dashboardId: null,
      }, 
      { status: 401 }
    );
  }

  try{
    const existingDashboard = await prisma.dashboard.findUnique({ //getting owner id from the dashboard id
      where: { dashboardId: dashboardId },
      select: { ownerId: true },
    });

    if (!existingDashboard){ //checking if dashboard exists
      return NextResponse.json<PUTResponse>(
        {
          success: false,
          message: "Dashboard not found",
          dashboardId: null,
        },
        { status: 404 }
      );
    }

    if (existingDashboard.ownerId !== session.user.id){ //comparing dashboard owner id to logged in user id
      return NextResponse.json<PUTResponse>(
        {
          success: false,
          message: "Forbidden",
          dashboardId: null,
        },
        { status: 403 }
      );
    }

    const body: PUTRequestBody = await req.json();

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.isPublic !== undefined) data.isPublic = body.isPublic;

    const dashboard = await prisma.$transaction(async (tx) => { //changed to a transaction in case any tag changes fail
      const updatedDashboard = await tx.dashboard.update({
        where: { dashboardId: dashboardId },
        data,
      });

      if (body.tagIds !== undefined) {
        await tx.dashboardTag.deleteMany({
          where: {
            dashboardId: dashboardId,
          },
        });

        if (body.tagIds.length > 0) {
          await tx.dashboardTag.createMany({
            data: body.tagIds.map((tagId) => ({
              dashboardId: dashboardId,
              tagId,
            })),
          });
        }
      }

      return updatedDashboard;
    });
    
    if (!dashboard) throw new Error("Failed to update dashboard");
    
    return NextResponse.json<PUTResponse>({ success: true, message: "Dashboard updated successfully", dashboardId: dashboardId }, { status: 200 });
  
  } catch(error){
    console.error("Failed to update dashboard:", error);
    return NextResponse.json<PUTResponse>({ success: false, message: "Failed to update dashboard", dashboardId: null }, { status: 500 });
  }
}


///////////////////////////////////////////////////////////
//DELETE A DASHBOARD


//No body required - just ID via the URL

interface DELETEResponse{
  success: boolean;
  message: string;
  dashboardId: string | null;
}

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ dashboardId: string }> })
  : Promise<NextResponse<DELETEResponse>>{

  try{
    const { dashboardId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id){
      return NextResponse.json<DELETEResponse>({ success: false, message: "Unauthorized", dashboardId: null }, { status: 401 });
    }

    const existingDashboard = await prisma.dashboard.findUnique({
      where: { dashboardId: dashboardId },
      select: { ownerId: true },
    });

    if (!existingDashboard){
      return NextResponse.json<PUTResponse>(
        {
          success: false,
          message: "Dashboard not found",
          dashboardId: null,
        },
        { status: 404 }
      );
    }

    if (existingDashboard.ownerId !== session.user.id){
      return NextResponse.json<PUTResponse>(
        {
          success: false,
          message: "Forbidden",
          dashboardId: null,
        },
        { status: 403 }
      );
    }

    const dashboard = await prisma.dashboard.delete({ //ownership confirmed so we can just delete
      where: { dashboardId: dashboardId },
    });

    if (!dashboard) throw new Error("Failed to delete dashboard");

    return NextResponse.json<DELETEResponse>({ success: true, message: "Dashboard deleted successfully", dashboardId: dashboardId }, { status: 200 });

  }
  catch(error){
    console.error("Failed to delete dashboard:", error);
    return NextResponse.json<DELETEResponse>({ success: false, message: "Failed to delete dashboard", dashboardId: null }, { status: 500 });
  }
}