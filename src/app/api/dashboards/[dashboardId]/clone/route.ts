import { ImageAsset, ModuleType, NestedDictionaryModule } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";

import { DictNode, DictNodeContentImage, DictNodeContentText, DictNodeNavigable } from "@/components/Modules/NestedDictionary/NestedDictionary";


////////////////////////////////////////////////////////////
// CLONE A DASHBOARD TO CURRENT USER'S ACCOUNT

interface CloneDashboardRequestBody {
  dashboardId: string;
  newTitle: string;
  newDescription: string;
}

interface CloneDashboardResponse {
  success?: boolean;
  dashboardId?: string;
  error?: string;
}

function assertKeys<T extends object>(obj: T, keys: string[]): void {
  if (!keys.every((key) => key in obj)) {
    throw new Error(`Payload is missing required keys: ${keys.join(", ")}`);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ dashboardId: string }> }
) {
  const { dashboardId } = await params;

  // Validate session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body: CloneDashboardRequestBody = await req.json();

  try {
    assertKeys(body, ["dashboardId", "newTitle", "newDescription"]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request payload";

    return new NextResponse(message, { status: 400 });
  }

  // Get target
  const targetDashboard = await prisma.dashboard.findUnique({
    where: {
      dashboardId: dashboardId,
    },
  });

  // If not found, return 404
  if (!targetDashboard) {
    return new NextResponse("Dashboard not found", { status: 404 });
  }

  // Double check it's marked as public
  if (!targetDashboard.isPublic) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Double check it's not already owned by the current user
  if (targetDashboard.ownerId === session.user.id) {
    return new NextResponse("You cannot clone your own dashboard", {
      status: 403,
    });
  }

  ///////////////////////////////////////////////
  // If we got here, we're good. Begin cloning.

  // Include all modules listed in /module_definitions/module_definitions.ts
  const includeAllModulesClause: Record<string, boolean> = {};
  Object.values(ModuleType).forEach((moduleType) => {
    includeAllModulesClause[moduleType] = true;
  });

  // Get source dashboard, and all the nested stuff
  const source = await prisma.dashboard.findUnique({
    where: { dashboardId: dashboardId },
    include: {
      dashboardTags: true,
      pages: {
        include: {
          modules: {
            include: includeAllModulesClause,
          },
        },
      },
    },
  });

  let cloned;
  try {
    cloned = await prisma.$transaction(async (tx) => {
      // Create new dashboard
      const newDashboard = await tx.dashboard.create({
        data: {
          ownerId: session.user.id,
          copiedFromId: dashboardId,
          dashboardId: body.dashboardId,
          title: body.newTitle,
          description: body.newDescription,
          isPublic: false,
        },
      });

      // Clone tags
      if (source.dashboardTags.length > 0) {
        await tx.dashboardTag.createMany({
          data: source.dashboardTags.map((tag) => ({
            dashboardId: newDashboard.dashboardId,
            tagId: tag.tagId,
          })),
        });
      }

      // Clone pages + modules
      for (const page of source.pages) {
        const newPage = await tx.page.create({
          data: {
            dashboardId: newDashboard.dashboardId,
            name: page.name,
            index: page.index,
          },
        });

        // Clone modules
        for (const module of page.modules) {
          const newModule = await tx.module.create({
            data: {
              moduleId: randomUUID(),
              pageId: newPage.pageId,
              moduleType: module.moduleType,
              x: module.x,
              y: module.y,
              w: module.w,
              h: module.h,
              minW: module.minW,
              minH: module.minH,
              maxW: module.maxW,
              maxH: module.maxH,
            },
          });

          // Clone module-specific table
          switch (module.moduleType) {
            case ModuleType.notes:
              if (module.notes) {
                await tx.notesModule.create({
                  data: {
                    moduleId: newModule.moduleId,
                    title: module.notes.title,
                    text: module.notes.text,
                  },
                });
              }
              break;

            case ModuleType.stopwatch:
              if (module.stopwatch) {
                await tx.stopwatchModule.create({
                  data: {
                    moduleId: newModule.moduleId,
                    title: module.stopwatch.title,
                    countUp: module.stopwatch.countUp,
                    value: module.stopwatch.value,
                  },
                });
              }
              break;

            case ModuleType.dice:
              if (module.dice) {
                await tx.diceModule.create({
                  data: {
                    moduleId: newModule.moduleId,
                    title: module.dice.title,
                    dice: module.dice.dice,
                  },
                });
              }
              break;

            case ModuleType.counter:
              if (module.counter) {
                await tx.counterModule.create({
                  data: {
                    moduleId: newModule.moduleId,
                    title: module.counter.title,
                    value: module.counter.value,
                    defaultValue: module.counter.defaultValue,
                    increment: module.counter.increment,
                    min: module.counter.min,
                    max: module.counter.max,
                    prefix: module.counter.prefix,
                    suffix: module.counter.suffix,
                  },
                });
              }
              break;

            case ModuleType.coinToss:
              if (module.coinToss) {
                await tx.coinTossModule.create({
                  data: {
                    moduleId: newModule.moduleId,
                    title: module.coinToss.title,
                    result: module.coinToss.result,
                  },
                });
              }
              break;

            case ModuleType.scoreTable:
              if (module.scoreTable) {
                await tx.scoreTableModule.create({
                  data: {
                    moduleId: newModule.moduleId,
                    title: module.scoreTable.title,
                    currentRound: module.scoreTable.currentRound,
                    players: module.scoreTable.players,
                    scores: module.scoreTable.scores,
                    roundNames: module.scoreTable.roundNames,
                  },
                });
              }
              break;

            case ModuleType.singleImage:
              if (module.singleImage) {

                try{
                  const newImageAsset = await createNewImageAsset(tx, module.singleImage.imageAssetId, session.user.id);
                  await tx.singleImageModule.create({
                    data: {
                      moduleId: newModule.moduleId,
                      title: module.singleImage.title,
                      imageAssetId: newImageAsset.imageAssetId,
                    },
                  });
                } catch (error) {
                  console.error("Failed to clone image asset:", error);
                }
              }
              break;

              case ModuleType.spinWheel:
                if (module.spinWheel) {
                  await tx.spinWheelModule.create({
                    data: {
                      moduleId: newModule.moduleId,
                      title: module.spinWheel.title,
                      segments: module.spinWheel.segments,
                    },
                  });
                }
                break;

              case ModuleType.nestedDictionary:
                if (module.nestedDictionary) {
                  await tx.nestedDictionaryModule.create({
                    data: {
                      moduleId: newModule.moduleId,
                      title: module.nestedDictionary.title,
                      dictionary: await replaceDictionaryImageAssetIds(tx, module.nestedDictionary.dictionary, session.user.id),
                      linksOnlyInDropdown: module.nestedDictionary.linksOnlyInDropdown,
                    },
                  });
                }
                break;

              case ModuleType.resourceBar:
                if (module.resourceBar) {
                  await tx.resourceBarModule.create({
                    data: {
                      moduleId: newModule.moduleId,
                      title: module.resourceBar.title,
                      bars: module.resourceBar.bars,
                    },
                  });
                }
                break;

              case ModuleType.list:
                if (module.list) {
                  await tx.listModule.create({
                    data: {
                      moduleId: newModule.moduleId,
                      title: module.list.title,
                      showCheckbox: module.list.showCheckbox,
                      showQuantity: module.list.showQuantity,
                      items: module.list.items,
                    },
                  });
                }
                break;
          }
        }
      }

      return newDashboard;
    });
  } catch (error) {
    console.error("Clone transaction failed:", error);

    const response: CloneDashboardResponse = {
      error: "Failed to clone dashboard",
    };

    return new NextResponse(JSON.stringify(response), { status: 500 });
  }

  const response: CloneDashboardResponse = {
    success: true,
    dashboardId: cloned.dashboardId,
  };

  return new NextResponse(JSON.stringify(response), { status: 200 });
}




//Create duplicate of image asset for new owner.
//Don't need to actually duplicate the blob - we're just gonna use chron jobs to clean up unowned stuff later.
async function createNewImageAsset(tx: Prisma.TransactionClient, imageAssetId: number, newOwnerId: string): Promise<ImageAsset> {
  const original = await tx.imageAsset.findUnique({
    where: {
      imageAssetId: imageAssetId,
    },
  });

  if (!original){
    throw new Error(`Image asset ${imageAssetId} not found`);
  }

  const newImageAsset = await tx.imageAsset.create({
    data: {
      storageKey: original.storageKey,
      byteSize: original.byteSize,
      width: original.width,
      height: original.height,
      ownerId: newOwnerId,
    },
  });
  return newImageAsset;
}

async function replaceDictionaryImageAssetIds(
  tx: Prisma.TransactionClient,
  rawDictionary: NestedDictionaryModule['dictionary'],
  newOwnerId: string
): Promise<NestedDictionaryModule['dictionary']> {

  const nodes = (typeof rawDictionary === "string"
    ? JSON.parse(rawDictionary)
    : structuredClone(rawDictionary)) as DictNode[];

    //Recursive walk function
  async function walkNodes(list: DictNode[]): Promise<void> {
    for (const node of list) {
      
      //If there actually IS an imageAssetId
      if (
        node.content?.type === "image" &&
        typeof node.content.imageAssetId === "number" &&
        node.content.imageAssetId > 0
      ) {
        //Create a duplicate imageAssetId row for the new owner
        const newAsset = await createNewImageAsset(tx, node.content.imageAssetId, newOwnerId);
        node.content.imageAssetId = newAsset.imageAssetId;
      }
      //I'm walkin' here!
      if (node.children?.length) {
        await walkNodes(node.children);
      }
    }
  }

  await walkNodes(nodes);
  return nodes as unknown as NestedDictionaryModule['dictionary'];
}