//Centralized module definition repository.
//Each object contains both default data, as well as default sizing.

//NOTE 1: ONLY data that needs to be stored in the DB should be here.
            //Otherwise just use a local useState().


//NOTE 2: Once a module is added here, it still needs to be added to DB/Backend.
        //Until then, it will not save, load, or clone.


import { ModuleDefinition } from "./module_template";
import type { DictNode } from "@/components/Modules/NestedDictionary/NestedDictionary";

//////////////////////////////////////////////////////////////
//Step 1: Add the new module to the list of ModuleTypes
/////////////////////////////////////////////////////////////
export enum ModuleType{
    coinToss = "coinToss",
    counter = "counter",
    dice = "dice",  
    notes = "notes",
    scoreTable = "scoreTable",
    singleImage = "singleImage",
    spinWheel = "spinWheel",
    stopwatch = "stopwatch",
    nestedDictionary = "nestedDictionary",
    resourceBar = "resourceBar",
    list = "list"
}



//////////////////////////////////////////////////////////////
//Step 2: Create the defaults for "data" and "layout"
    //defaultData: This is what's used in useSession. 
        //MUST include moduleType, moduleId, title
        // Plus whatever else is needed for the module.

    //defaultLayout: This is what's used in the grid layout.
        //Must match the fields you see used in the other modules below.
//////////////////////////////////////////////////////////////
export const MODULE_DEFINITIONS = {
    coinToss: {
        defaultData: {
            moduleType: ModuleType.coinToss,
            moduleId: null,
            title: "Coin Toss",
            result: null,
        },
        defaultLayout: {
            i: null, x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1, maxW: 3, maxH: 3, moduleType: ModuleType.coinToss,
        }
    },
    counter: {
        defaultData: {
            moduleType: ModuleType.counter,
            moduleId: null,
            title: "Counter",
            min: -100,
            max: 100,
            defaultValue: 0,
            increment: 1,
            value: 0,
            prefix: "",
            suffix: "",
        },
        defaultLayout: {
            i: null, x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1, maxW: 2, maxH: 2, moduleType: ModuleType.counter,
        }
    },
    dice: {
        defaultData: {
            moduleType: ModuleType.dice,
            moduleId: null,
            title: "Dice",
            dice: [],
            modifier: 0,
            diceColors: {
                d4: "#16a34a",
                d6: "#4f46e5",
                d8: "#2563eb",
                d10: "#dc2626",
                d12: "#9333ea",
                d20: "#d97706",
            },
        },
        defaultLayout: {
            i: null, x: 0, y: 0, w: 3, h: 2, minW: 3, minH: 2, maxW: 10, maxH: 10, moduleType: ModuleType.dice,
        }
    },
    notes: {
        defaultData: {
            moduleType: ModuleType.notes,
            moduleId: null,
            title: "Notes",
            text: "",
        }, 
        defaultLayout: {
            i: null, x: 0, y: 0, w: 2, h: 1, minW: 1, minH: 1, maxW: 10, maxH: 10, moduleType: ModuleType.notes,
        }
    },
    
    scoreTable: {
        defaultData: {
            moduleType: ModuleType.scoreTable,
            moduleId: null,
            title: "Score Table",
            players: ["", ""],
            scores: [
                [null, null, null],
                [null, null, null]
            ],
            roundNames: ["", "", ""],
            lowestScoreWins: false,
            showTotals: true,
            showHighlights: true,
        },
        defaultLayout: {
            i: null, x: 0, y: 0, w: 3, h: 2, minW: 3, minH: 2, maxW: 10, maxH: 10, moduleType: ModuleType.scoreTable
        }
    },
    singleImage: {
        defaultData: {
            moduleType: ModuleType.singleImage,
            moduleId: null,
            title: "Image",
            imageAssetId: null,
        },
        defaultLayout: {
            i: null, x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1, maxW: 10, maxH: 10, moduleType: ModuleType.singleImage,
        }
    },
    spinWheel: {
        defaultData: {
            moduleType: ModuleType.spinWheel,
            moduleId: null,
            title: "Spin Wheel",
            segments: ["1", "2", "3", "4"],
        },
        defaultLayout: {
            i: null, x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2, maxW: 5, maxH: 5, moduleType: ModuleType.spinWheel,
        }
    },
    stopwatch: {
        defaultData: {
            moduleType: ModuleType.stopwatch,
            moduleId: null,
            title: "Stopwatch",
            mode: "stopwatch",
            timerMinutes: 5,
            timerSeconds: 0,
            startedAt: null,
            elapsedSeconds: 0,
        },
        defaultLayout: {
            i: null, x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1, maxW: 2, maxH: 2, moduleType: ModuleType.stopwatch,
        }
    },
    nestedDictionary: {
        defaultData: {
            moduleType: ModuleType.nestedDictionary,
            moduleId: null as string | null,
            title: "Nested Dictionary",
            currentRoot: null as string | null,
            dictionary: [] as DictNode[],
            linksOnlyInDropdown: true,
        },
        defaultLayout: {
            i: null, x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2, maxW: 10, maxH: 10, moduleType: ModuleType.nestedDictionary,
        }
    },
    resourceBar: {
        defaultData : {
            moduleType: ModuleType.resourceBar,
            moduleId: null,
            title: "Resource Bar",
            bars: [
                { id: "default", label: "HP", value: 100, defaultValue: 100, min: 0, max: 100, increment: 1, color: "#ef4444"}
            ],
        },
        defaultLayout: {
            i: null, x: 0, y: 0, w: 2, h: 1, minW: 2, minH: 1, maxW: 6, maxH: 4, moduleType: ModuleType.resourceBar,
        }
    },
    list: {
        defaultData : {
            moduleType: ModuleType.list,
            moduleId : null,
            title: "List",
            showCheckbox: true,
            showQuantity: true,
            items: [],
        },
        defaultLayout: {
            i: null, x:0, y:0, w:2, h:1, minW: 1, minH: 1, maxW: 6, maxH: 6, moduleType: ModuleType.list,
        }
    },
} as const satisfies Record<ModuleType, ModuleDefinition<any>>;