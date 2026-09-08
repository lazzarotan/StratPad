import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { saveDashboardFromSession } from "@/app/api/dashboards/[dashboardId]/with-content/saveDashboardFromSession";
import { prisma } from "@/lib/prisma";
import { ModuleType } from '@/generated/prisma';

////////////////////////////////////////////////////////////
//GET an entire dashboard by ID
export async function GET(req, { params }) {

  const { dashboardId } = await params;

  //Check if the dashboard is public

  const dbMetadata = await prisma.dashboard.findUnique({
    where: {
      dashboardId: dashboardId,
    },
  });

  //Reject if not found.
  if(!dbMetadata){
    return NextResponse.json({ success: false, error: "Dashboard not found" }, { status: 404 });
  }

  //Validate session
  const session = await auth.api.getSession({ headers: await headers() });

  //Reject if not public && not owned by user.
  if(!dbMetadata.isPublic){
    if(!session?.user?.id){
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if(dbMetadata.ownerId !== session.user.id){
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  //Include all modules listed in /module_definitions/module_definitions.ts
  const includeAllModulesClause = {}
  Object.values(ModuleType).forEach(moduleType => {
      includeAllModulesClause[moduleType] = true;
  });


  try {
      //Get the entire thing in one go
      const dashboardQuery = await prisma.dashboard.findUnique({
          where: {
              dashboardId: dashboardId,
          },
          include: {
              pages: {
                  include: {
                      modules: {
                          include: includeAllModulesClause,
                      },
                  },
              },
          },
      });

      //Return 404 if not found
      if (!dashboardQuery) {
          return NextResponse.json({ success: false, error: "Dashboard not found" }, { status: 404 });
      }

      //Split module data into its array (Mirrors how it's stored in session storage)
      const moduleData = [];
      for (const page of dashboardQuery.pages) {
          for (const mod of page.modules) {

            //Get the module-specific data
              const typeData = mod[mod.moduleType];

              if (typeData) {
                //Strip out createdAt and updatedAt - that's backend noise.
                  const { createdAt, updatedAt, ...fields } = typeData;
                  //Push the other fields + moduleType (which isn't stored in the DB)
                  moduleData.push({
                      moduleType: mod.moduleType,
                      ...fields,
                  });
              }
          }
      }

      //Return in the similar format to how it's stored in session storage
      const response = {
          success: true,
          dashboard: {
              dashboardId: dashboardQuery.dashboardId,
              title: dashboardQuery.title,
              description: dashboardQuery.description,
              isPublic: dashboardQuery.isPublic,
          },
          pages: dashboardQuery.pages.map(page => ({
              pageId: page.pageId,
              name: page.name,
              index: page.index,
              modules: page.modules.map(m => ({
                  moduleId: m.moduleId,
                  moduleType: m.moduleType,
                  x: m.x,
                  y: m.y,
                  w: m.w,
                  h: m.h,
                  minW: m.minW,
                  minH: m.minH,
                  maxW: m.maxW,
                  maxH: m.maxH,
              })),
          })),
          moduleData,
      };

      return NextResponse.json(response);

      //What's an error? We don't have those around here.
  } catch (err) {
      console.error(err);
      return NextResponse.json(
          { success: false, error: "An unknown error occurred while loading the dashboard." },
          { status: 500 },
      );
  }
}





////////////////////////////////////////////////////////////
//UPSERT an entire dashboard
      //I.e. CREATE if it doesn't exist, else just UPDATE

//Note: Most of this takes place in saveDashboardFromSession.js
export async function POST(req, { params }) {
  try {

    const { dashboardId } = await params;

    //Validate session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    //Get body
    const body = await req.json();

    //Save dashboard
    const savedId = await saveDashboardFromSession({
      ownerId: session.user.id,
      payload: body,
    });

    return NextResponse.json({ dashboardId: savedId });
  } catch (err) {
    let msg;
    if (err instanceof Error) {
      msg = err.message;
    } else {
      msg = String(err);
    }
    if (msg.includes("Record to update not found")) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    if (msg.includes("Invalid payload") || msg.includes("Invalid moduleType")) {
      return new NextResponse(msg, { status: 400 });
    }
    return new NextResponse(msg, { status: 500 });
  }
}