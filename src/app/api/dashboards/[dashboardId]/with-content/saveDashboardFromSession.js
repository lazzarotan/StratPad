//Refactor of Christian's endpoint
/*
- Started using UPSERT, which is basically "CREATE if it doesn't exist, else just UPDATE"
- Moved all the module-specific sections to their own functions + a big ol' switch
- Added some additional payload validation
*/


import { prisma } from "@/lib/prisma";
import { ModuleType, CoinResult } from "@/generated/prisma";
import fs from "fs";

const MODULE_TYPES = new Set(Object.values(ModuleType));

////////////////////////////////////////////////////////////
//Validation Helpers
function assertKeys(obj, keys) {
  if (!keys.every(key => key in obj)) {
    throw new Error(`Payload is missing required keys: ${keys.join(", ")}`);
  }
}

function assertPayload(payload) {
  if (!payload?.dashboard || !Array.isArray(payload.pages)) {
    throw new Error("Invalid payload");
  }
}

function assertModuleType(value) {
  if (!MODULE_TYPES.has(value)) throw new Error(`Invalid moduleType: ${String(value)}`);
  return value;
}

/////////////////////////////////////////////////////////////
//Main Function
export async function saveDashboardFromSession({ ownerId, payload }) {

  //Write payload to JSON file for inspection
  fs.writeFileSync("ClientSave.payload.json", JSON.stringify(payload, null, 2));

  assertPayload(payload);

  //Make sure we have the main objects
  assertKeys(payload, ["dashboard", "pages", "moduleData"]);
  

  //Make sure we have the columns for the two main obj
  assertKeys(payload.dashboard, ["dashboardId", "title", "description", "isPublic"]);
  payload.pages.forEach(page => {
    assertKeys(page, ["pageId", "name", "index", "modules"]);
  });
  //These are the only two we can reliably check for Modules..
  payload.moduleData.forEach(moduleData => {
    assertKeys(moduleData, ["moduleId", "moduleType"]);
  });

  const dashboard = payload.dashboard;
  const pages = payload.pages;


  //CREATE/UPDATE DASHBOARD
  return await prisma.$transaction(async (tx) => {
    //Double check we got an id
    const hasDashboardId = dashboard.dashboardId != null;
    if (!hasDashboardId) throw new Error("Dashboard ID is required");

    const existingDashboard = await tx.dashboard.findUnique({ //checking dashboard ownership
      where: { dashboardId: dashboard.dashboardId },
      select: { ownerId: true },
    });

    if (existingDashboard && existingDashboard.ownerId !== ownerId) {
      throw new Error("Forbidden");
    }


    //CREATE or UPDATE dashboard.
    await tx.dashboard.upsert({
      where: {dashboardId: dashboard.dashboardId},
      create: {
        ownerId: ownerId,
        dashboardId: dashboard.dashboardId,
        title: dashboard.title,
        description: dashboard.description,
        isPublic: Boolean(dashboard.isPublic),
      },
      update: {
        title: dashboard.title,
        description: dashboard.description,
        isPublic: Boolean(dashboard.isPublic),
      }
    })

    const incomingPageIds = pages.map(p => p.pageId);

    //Delete any pages that were removed
    await tx.page.deleteMany({
      where: {
        dashboardId: dashboard.dashboardId,
        pageId: {notIn: incomingPageIds}
      }
    });

    //Build a lookup map for module-specific data (title, text, value, etc.)
    const moduleDataMap = new Map(
      (payload.moduleData ?? []).map((md) => [md.moduleId, md])
    );

    //CREATE or UPDATE all pages.
    for (const page of pages){
      await tx.page.upsert({
        where: {pageId: page.pageId},
        create: {
          pageId: page.pageId,
          dashboardId: dashboard.dashboardId,
          name: page.name,
          index: page.index,
        },
        update: {
          name: page.name,
          index: page.index,
        }
      });

      const incomingModuleIds = (page.modules ?? []).map(m => m.moduleId);

      //Delete modules that were removed
      await tx.module.deleteMany({
        where: {
          pageId: page.pageId,
          moduleId: {notIn: incomingModuleIds},
        }
      });

      for (const m of page.modules ?? []) {
        const moduleType = assertModuleType(m.moduleType);

        const x = Number.isFinite(m.x) ? m.x : 0;
        const y = Number.isFinite(m.y) ? m.y : 0;
        const w = Number.isFinite(m.w) ? m.w : 1;
        const h = Number.isFinite(m.h) ? m.h : 1;
        const minW = Number.isFinite(m.minW) ? m.minW : 1;
        const minH = Number.isFinite(m.minH) ? m.minH : 1;
        const maxW = Number.isFinite(m.maxW) ? m.maxW : 10;
        const maxH = Number.isFinite(m.maxH) ? m.maxH : 10;

      //CREATE or UPDATE Module row
      await tx.module.upsert({
        where: {moduleId: m.moduleId},
        create:{
          moduleId: m.moduleId,
          pageId: page.pageId,
          moduleType: m.moduleType,
          x: m.x,
          y: m.y,
          w: w,
          h: h,
          minW: minW,
          minH: minH,
          maxW: maxW,
          maxH: maxH,
        },
        //Just update the Position / size
        update:{
          x: m.x,
          y: m.y,
          w: w,
          h: h,
        }
      });


        //CREATE/UPDATE Module-specific data
        const data = moduleDataMap.get(m.moduleId) ?? {};

        switch (moduleType) {
          case ModuleType.notes:      await upsertNotes(tx, m.moduleId, data);      break;
          case ModuleType.stopwatch:  await upsertStopwatch(tx, m.moduleId, data);  break;
          case ModuleType.coinToss:   await upsertCoinToss(tx, m.moduleId, data);   break;
          case ModuleType.dice:       await upsertDice(tx, m.moduleId, data);       break;
          case ModuleType.counter:    await upsertCounter(tx, m.moduleId, data);    break;
          case ModuleType.scoreTable: await upsertScoreTable(tx, m.moduleId, data); break;
          case ModuleType.singleImage: await upsertSingleImage(tx, m.moduleId, data); break;
          case ModuleType.spinWheel:   await upsertSpinWheel(tx, m.moduleId, data);   break;
          case ModuleType.nestedDictionary: await upsertNestedDictionary(tx, m.moduleId, data); break;
          case ModuleType.resourceBar: await upsertResourceBar(tx, m.moduleId, data); break;
          case ModuleType.list:        await upsertList(tx, m.moduleId, data);        break;
          default: throw new Error(`Unhandled moduleType: ${moduleType}`);
        }
      }
    }
    return dashboard.dashboardId;
  });
}

//////////////////////////////////////////////////////////////////
//Module-specific upsert functions

//All follow a similar pattern:
//1. Get the data from "Data" arg
//2. Validate/set default values
//3. Run an UPSERT query (CREATE or UPDATE, if it already exists.)
async function upsertNotes(tx, moduleId, data) {
  const fields = {
    title: data.title ?? "Notes",
    text: data.text ?? "",
  };
  await tx.notesModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields },
    update: fields,
  });
}

async function upsertStopwatch(tx, moduleId, data) {
  const fields = {
    title: data.title ?? "Stopwatch",
    mode: data.mode ?? "stopwatch",
    timerMinutes: Number.isFinite(data.timerMinutes) ? data.timerMinutes : 5,
    timerSeconds: Number.isFinite(data.timerSeconds) ? data.timerSeconds : 0,
    elapsedSeconds: Number.isFinite(data.elapsedSeconds) ? data.elapsedSeconds : 0,
    startedAt: Number.isFinite(data.startedAt) ? BigInt(data.startedAt) : null,
  };
  await tx.stopwatchModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields },
    update: fields,
  });
}

async function upsertCoinToss(tx, moduleId, data) {
  let result = null;
  if (data.result === "heads") result = CoinResult.heads;
  else if (data.result === "tails") result = CoinResult.tails;

  const fields = {
    title: data.title ?? "Coin Toss",
    result,
  };
  await tx.coinTossModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields },
    update: fields,
  });
}

async function upsertDice(tx, moduleId, data) {
  
  const dice = data.dice ?? [];
  const fields = {
    title: data.title ?? "Dice",
    dice,
    modifier: Number.isFinite(data.modifier) ? data.modifier : 0,
  };
  await tx.diceModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields },
    update: fields,
  });
}

async function upsertCounter(tx, moduleId, data) {
  const fields = {
    title: data.title ?? "Counter",
    value: Number.isFinite(data.value) ? data.value : 0,
    defaultValue: Number.isFinite(data.defaultValue) ? data.defaultValue : 0,
    increment: Number.isFinite(data.increment) ? data.increment : 1,
    // Leave min/max undefined if they aren't provided so we don't overwrite DB/defaults with null
    min: Number.isFinite(data.min) ? data.min : data.min,
    max: Number.isFinite(data.max) ? data.max : data.max,
    prefix: data.prefix ?? "",
    suffix: data.suffix ?? "",
  };
  await tx.counterModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields },
    update: fields,
  });
}

async function upsertScoreTable(tx, moduleId, data) {
  const fields = {
    title: data.title ?? "Game Score",
    currentRound: Number.isFinite(data.currentRound) ? data.currentRound : 0,
    players: data.players ?? ["Player 1", "Player 2"],
    scores: data.scores ?? [[null, null, null], [null, null, null]],
    roundNames: data.roundNames ?? ["Round 1", "Round 2", "Round 3"],
  };
  await tx.scoreTableModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields },
    update: fields,
  });
}


async function upsertSingleImage(tx, moduleId, data){
  const fields = {
    imageAssetId: data.imageAssetId ?? null,
    title: data.title ?? "Image",
  }
  await tx.singleImageModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields },
    update: fields,
  });
}

async function upsertSpinWheel(tx, moduleId, data){
  const fields = {
    title: data.title ?? "Spin Wheel",
    segments: data.segments ?? ["1", "2", "3", "4"],
  }
  await tx.spinWheelModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields },
    update: fields,
  });
}


async function upsertNestedDictionary(tx, moduleId, data){
  const fields = {
    title: data.title ?? "Nested Dictionary",
    dictionary: data.dictionary ?? {},
    linksOnlyInDropdown: data.linksOnlyInDropdown ?? true,
  };
  await tx.nestedDictionaryModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields},
    update: fields,
  });
}

async function upsertResourceBar(tx, moduleId, data) {
  const fields = {
    title: data.title ?? "Resource Bar",
    bars: Array.isArray(data.bars) ? data.bars : [],
  };
  await tx.resourceBarModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields },
    update: fields,
  });
}

async function upsertList(tx, moduleId, data) {
  const fields = {
    title: data.title ?? "List",
    showCheckbox: data.showCheckbox ?? true,
    showQuantity: data.showQuantity ?? true,
    items: Array.isArray(data.items) ? data.items : [],
  };
  await tx.listModule.upsert({
    where: { moduleId },
    create: { moduleId, ...fields },
    update: fields,
  });
}