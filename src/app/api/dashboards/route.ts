import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Dashboard } from "@/generated/prisma";

interface DashboardTagSelectedFields {
  tagId: number;
  name: string;
}

interface GETResponse{
  success: boolean;
  dashboards: DashboardSelectedFields[];
  message: string;
}

interface DashboardSelectedFields{
  dashboardId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  copiedFromId: string | null;
  tags: DashboardTagSelectedFields[];
}

////////////////////////////////////////////////////////////
//GET all dashboards for a user
export async function GET(req: Request): Promise<NextResponse<GETResponse>> {
    try {
      //Validate session
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user?.id) {
        return NextResponse.json<GETResponse>({
          success: false,
          dashboards: [],
          message: "Unauthorized",
        }, { status: 401 });
      }
  

    ///CAN ADD TAGS AND SEARCH FILTERS AND STUFF HERE LATER
    const url = new URL(req.url);
    const mine = url.searchParams.get("mine");

    //E.g. const sort = url.searchParams.get("sort") ?? "createdAt"    //Sort by createdAt by default
        //const desc = url.searchParams.get("desc") ?? "true";       //Sort in descending order by default
        //const count = url.searchParams.get("count") ?? 10;         //Limit to 10 dashboards by default

    const whereClause: any = {}
    
    if(mine){
        whereClause.ownerId = session.user.id as string;
    }


      //Return dashboard metadata for all dashboards owned by the user
      const dashboardsRaw = await prisma.dashboard.findMany({
        where: whereClause,
        select: {
          dashboardId: true,
          title: true,
          description: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          copiedFromId: true,
          dashboardTags: {
            select: {
              tag: {
                select: {
                  tagId: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      //findmany is a nested structure due to inclusion of tags, this maps dashboardtags to a tag array to flatten
      const dashboards: DashboardSelectedFields[] = dashboardsRaw.map((dashboard) => ({
        dashboardId: dashboard.dashboardId,
        title: dashboard.title,
        description: dashboard.description,
        isPublic: dashboard.isPublic,
        createdAt: dashboard.createdAt,
        updatedAt: dashboard.updatedAt,
        copiedFromId: dashboard.copiedFromId,
        tags: dashboard.dashboardTags.map((dashboardTag) => ({
          tagId: dashboardTag.tag.tagId,
          name: dashboardTag.tag.name,
        })),
      }));
  
      const response: GETResponse = {
        success: true,
        dashboards: dashboards,
        message: "Dashboards loaded successfully",
      }

      return NextResponse.json<GETResponse>(response, { status: 200 });
  
      //Server error
    } catch (err) {
      console.error(err);
      return NextResponse.json<GETResponse>({
        success: false,
        dashboards: [],
        message: "Failed to load dashboards.",
      }, { status: 500 });
    }
  }


////////////////////////////////////////////////////////////
//POST a new dashboard
import { Page } from "@/generated/prisma";
import { randomUUID } from "crypto";


interface POSTRequestBody{
  title: string;
  description: string;
  isPublic: boolean;
  tagIds?: number[];
}

interface POSTResponse{
  success: boolean;
  message: string;
  dashboardId: string | null;
}


////////////////////////////////////////////////////////////
//CREATE A NEW BLANK DASHBOARD + DEFAULT PAGE
export async function POST(req: Request): Promise<NextResponse<POSTResponse>> {
  try {
    //Validate session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id){
      return NextResponse.json<POSTResponse>({ 
        success: false, 
        message: "Unauthorized", 
        dashboardId: null,
      }, 
      { status: 401 });
    }
    
    //Get body
    const body: POSTRequestBody = await req.json();

    //Generate a new ID
    const newDashboardId = randomUUID() as string;

    //Create dashboard and default blank page
    const newDashboard = await prisma.dashboard.create({
      data: {
        dashboardId: newDashboardId,
        title: body.title,
        description: body.description,
        isPublic: body.isPublic,
        ownerId: session.user.id,
        copiedFromId: null,
        pages:{
          create: [{
            name: "Page 1",
            index: 0,
          }]
        },
        dashboardTags: body.tagIds && body.tagIds.length > 0
          ? {
              create: body.tagIds.map((tagId) => ({
                tag: {
                  connect: { tagId },
                },
              })),
            }
          : undefined,
      }
    });
    if(!newDashboard) throw new Error("Failed to create dashboard");

    return NextResponse.json<POSTResponse>({ 
      success: true, 
      message: "Dashboard created successfully", 
      dashboardId: newDashboardId 
    }, { status: 200 });

    }
    catch(error){
      console.error("Failed to create dashboard:", error);
      return NextResponse.json<POSTResponse>({ 
        success: false, 
        message: "Failed to create dashboard", 
        dashboardId: null,
      }, 
        { status: 500 });
    }
}