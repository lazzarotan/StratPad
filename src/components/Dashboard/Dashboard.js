"use client";
import { verticalCompactor } from "react-grid-layout/core";
import ZoomPanPinchWrapper from "./Zoom-Pan-Pinch/ZoomPanPinchWrapper";
//Needed to scale dragging modules by PX when zoomed.
import { setTransform } from "react-grid-layout/core";

import { useRef, useState, useEffect, useMemo } from "react";
import { MODULE_SESSION_PREFIX } from "@/client_API_calls/session_storage/useSession";
import { setSessionStorage, clearKeyFromSessionStorage } from "@/client_API_calls/session_storage/session_storage_utils";
import "./Dashboard.css";
//Prevents Server/Client reconciliation errs.
import dynamic from "next/dynamic";

//Context containing route-specific config
import { useDashboardMode } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import AlertModal from "@/components/AlertModal/AlertModal";

//Modules
import Stopwatch from "@/components/Modules/Stopwatch/Stopwatch";
import Counter from "../Modules/Counter/Counter";
import Dice from "../Modules/Dice/Dice";
import CoinToss from "../Modules/CoinToss/CoinToss";
import ScoreTable from "../Modules/ScoreTable/ScoreTable";
import Notes from "../Modules/Notes/Notes";
import SingleImage from "../Modules/SingleImage/SingleImage";
import SpinWheel from "../Modules/SpinWheel/SpinWheel";
import NestedDictionary from "../Modules/NestedDictionary/NestedDictionary";
import ResourceBar from "../Modules/ResourceBar/ResourceBar";
import List from "../Modules/List/List";



//Module Definitions + Default Factories
import { MODULE_DEFINITIONS, ModuleType } from "@/module_definitions/module_definitions";
import { createDefaults_ModuleData, createDefaults_PageModule } from "./moduleFactory";

//Modal to overlay for the settings panel.
import EditModal from "@/components/EditModal/EditModal";

const ReactGridLayout = dynamic(() => import("react-grid-layout"), { ssr: false });
import ModifiedGridBackground from "./Zoom-Pan-Pinch/ModifiedGridBackground";
import Paper from "@mui/material/Paper";


const MODULES = {
    stopwatch: Stopwatch,
    counter: Counter,
    dice: Dice,
    coinToss: CoinToss,
    scoreTable: ScoreTable,
    notes: Notes,
    singleImage: SingleImage,
    spinWheel: SpinWheel,
    nestedDictionary: NestedDictionary,
    resourceBar: ResourceBar,
    list: List,
};



///////////////////////////////////////////////////
//CONSTANTS FOR THE GRIDS 'VIRTUAL' SIZE
// I.E. the grid is not always 1600x1200px when rendered, but it's treated as such for calculations.
///////////////////////////////////////////////////

//2000 x 1400 == 4:3 aspect ratio
const GRID_WIDTH = 2000;
const GRID_HEIGHT = 1400;

//12 x 9 == 4:3 aspect ratio, keeps every cell as a square
const GRID_COLS = 12;
const GRID_ROWS = 9;

const ROW_HEIGHT = GRID_HEIGHT / GRID_ROWS;





export default function Dashboard({
    activePage,
    pages,
    setPages,
    draggingModuleType,
    isDashboardLoading = false,
    setIsDashboardLoading = () => {},
}) {

    useEffect(() => { import("./DragDropTouch"); }, []);

    const [editingModuleId, setEditingModuleId] = useState(null);
    const [moduleReloadKeys, setModuleReloadKeys] = useState({});
    const skipNextLayoutChange = useRef(false);

    const { showGrid, canDragModules, canOpenSettings, isPlayMode } = useDashboardMode();
    const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '' });

    const containerRef = useRef(null);

    //SCALING STUFF - used to sync px travelled for dragging between RGL & the zoom-pan-pinch wrapper.
    const initialScale = useMemo(() => {
        if (typeof window === 'undefined') return 1;
        const containerWidth = containerRef.current?.clientWidth ?? window.innerWidth;
        return containerWidth / GRID_WIDTH;
    }, []);
    //Current scale of the grid - Updated by ZoomPanPinchWrapper when zoom in/out happen.
    //Consumed
    const [currentScale, setCurrentScale] = useState(initialScale);
    const safeActivePage = Math.min(Math.max(activePage ?? 0, 0), Math.max(pages.length - 1, 0));
    const activePageData = pages[safeActivePage] ?? { modules: [] };

    const diceModuleIds = useMemo(() => {
        const modules = activePageData.modules ?? [];
        return modules
            .filter((m) => m.moduleType === "dice")
            .map((m) => m.i);
    }, [activePageData]);

    useEffect(() => {
        if (!isDashboardLoading) return;

        if (diceModuleIds.length === 0) { //just a quick load overlay if no dice on dashboard
            const timer = window.setTimeout(() => {
                setIsDashboardLoading(false);
            }, 150);

            return () => clearTimeout(timer);
        }
    }, [diceModuleIds.length, isDashboardLoading, setIsDashboardLoading]);

    const positionStrategy = useMemo(() => ({
        type: "transform",
        scale: currentScale,
        calcStyle(pos) { return setTransform(pos); },
    }), [currentScale]);

    // Module-specific resize rules for constraints that min/max can't express
    const MODULE_RESIZE_RULES = {
        [ModuleType.coinToss]: (w, h) => {
            if (w > 1 && h < 2) return { w: 1, h };
            return { w, h };
        },
    };

    function onResize(layout, oldItem, newItem, placeholder) {
        const baseId = newItem.i.replace(/-\d+$/, '');
        const mod = pages[activePage].modules.find((m) => m.i === baseId || m.i === newItem.i);
        if (!mod) return;

        const rule = MODULE_RESIZE_RULES[mod.moduleType];
        if (rule) {
            const corrected = rule(newItem.w, newItem.h);
            newItem.w = corrected.w;
            newItem.h = corrected.h;
            placeholder.w = corrected.w;
            placeholder.h = corrected.h;
        }
    }

    function onDropFromOutside(finalLayout, layoutItem, event) {

        //Get the module type from the drag data
        const moduleType = event.dataTransfer.getData("text/plain");

        //Ignore drops that aren't from the sidebar
        if (!MODULES[moduleType]) return;

        //Create module data obj
        const newModuleData = createDefaults_ModuleData(moduleType);
        //Create pageModule obj to track position/size on the page
        const newPageModule = createDefaults_PageModule(newModuleData.moduleId, moduleType);

        //Use the position from where it was dropped on the grid
        newPageModule.x = layoutItem.x;
        newPageModule.y = layoutItem.y;

        //Add module data obj to session storage
        const moduleKey = MODULE_SESSION_PREFIX + newModuleData.moduleId;
        setSessionStorage(moduleKey, newModuleData);

        //Build a map of final positions from the layout (includes pushed items)
        const layoutMap = new Map(finalLayout.map((l) => [l.i, l]));

        //Update existing modules with their final positions and add the new one
        const pagesCopy = pages.map((page, i) => {
            if (i !== safeActivePage) return page;
            const updatedModules = page.modules.map((m) => {
                const updated = layoutMap.get(m.i);
                if (!updated) return m;
                return { ...m, x: updated.x, y: updated.y, w: updated.w, h: updated.h };
            });
            return { ...page, modules: [...updatedModules, newPageModule] };
        });
        skipNextLayoutChange.current = true;
        setPages(pagesCopy);
    }

    function onRemoveItem(id) {
        //Remove module data obj from session storage
        const moduleKey = MODULE_SESSION_PREFIX + id;
        clearKeyFromSessionStorage(moduleKey);

        //Remove pageModule obj from pages.modules[] (new array to avoid mutating state)
        const pagesCopy = pages.map((page, i) =>
            i === safeActivePage
                ? { ...page, modules: page.modules.filter((m) => m.i !== id) }
                : page
        );
        setPages(pagesCopy);
    }

    //Update the [pages] state when the layout changes
    function onLayoutChange(layout) {
        // //Skip if we just updated state ourselves (prevents infinite loop)
        // if (skipNextLayoutChange.current) {
        //     skipNextLayoutChange.current = false;
        //     return;
        // }

        //Prevents onLayoutChange from triggering when dragging from outside
        if (draggingModuleType) return;


        //Create a map of the layout
        const layoutMap = new Map(
            //Regex to remove trailing -0 from RGL (it appends this internally.. But only sometimes???)
            layout.map((l) => [l.i.replace(/-\d+$/, ""), l])
        );
        //Update the [pages] state
        const pagesCopy = pages.map((page, i) => {
            //If the page is not the active page, return the page as is
            if (i !== safeActivePage) return page;
            return {
                ...page,
                modules: page.modules.map((m) => {
                    const updated = layoutMap.get(m.i);
                    if (!updated) return m;
                    return { ...m, x: updated.x, y: updated.y, w: updated.w, h: updated.h };
                })
            };
        });
        setPages(pagesCopy);
    }


    function onSettingsItem(id) {

        if (!canOpenSettings) {
            setAlertModal({ open: true, title: 'Edit Mode Required', message: 'Switch to Edit mode to open settings.' });
            return;
        }

        setEditingModuleId(id);
    }

    function onSaveSettings(id) {
        setModuleReloadKeys(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    }

    function onModuleReady() {
        setIsDashboardLoading(false);
    }

    function renderModules() {
        const modules = activePageData.modules;


        return modules.map((m) =>
            //Change key after saving settings - forces module to reload with new data.
            <div key={`${m.i}-${moduleReloadKeys[m.i] || 0}`}
                data-grid={m}
                className="module-box"
            >
                {/* Render each module component */}
                {(() => {
                    const ModuleComponent = MODULES[m.moduleType];
                    if (ModuleComponent) {
                        return (
                            <ModuleComponent
                                id={m.i}
                                onRemove={onRemoveItem}
                                onSettings={onSettingsItem}
                                onReady={m.moduleType === "dice" ? onModuleReady : undefined}
                            />
                        );
                    }
                    return <div>Unknown module: {m.moduleType}</div>;
                })()}
            </div>
        );
    }

    const currentLayout = activePageData.modules;


    // const finalLayout = canDragModules
    //     ? currentLayout
    //     : currentLayout.map((layoutItem) => ({ ...layoutItem, static: true }));


    return (
        <Paper sx={{ overflow: 'hidden'}}>
        <AlertModal
            open={alertModal.open}
            title={alertModal.title}
            message={alertModal.message}
            onConfirm={() => setAlertModal({ ...alertModal, open: false })}
            confirmText="OK"
        />
        <div
            className={`dashboard-area${isPlayMode ? " dashboard-area--play" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            ref={containerRef}
        >
            {isDashboardLoading && (
                <div className="dashboard-loading-overlay">
                    <div>Loading dashboard</div>
                    <div className="dashboard-load-spinner" />
                </div>
            )}
            <ZoomPanPinchWrapper
                gridWidth={GRID_WIDTH} //Width of the grid
                containerRef={containerRef} //Ref to the container div
                initialScale={initialScale} //Initial scale of the grid
                setCurrentScale={setCurrentScale}  //Wrapper will update the current scale so dragging works correctly
            >
                <div className="dashboard-grid-wrapper">
                    <ModifiedGridBackground
                        width={GRID_WIDTH}
                        cols={GRID_COLS}
                        rowHeight={ROW_HEIGHT}
                        margin={[5, 14]}
                        rows={GRID_ROWS}
                        color="#e0e0e0"
                        strokeWidth={1}
                        style={{ zIndex: 0, position: "absolute" }}
                    />
                </div>
                <div
                    className="dashboard-grid-centering"
                    style={{
                        width: GRID_WIDTH,
                        minHeight: GRID_HEIGHT,
                        margin: isPlayMode ? "0 auto" : undefined,
                    }}
                >
                    <ReactGridLayout
                        width={GRID_WIDTH}
                        gridConfig={
                            {
                                cols: GRID_COLS,
                                rowHeight: ROW_HEIGHT,
                                maxRows: GRID_ROWS,
                                margin: [5, 14],
                                containerPadding: [5, 14]
                            }
                        }
                        onLayoutChange={onLayoutChange}
                        onDrop={onDropFromOutside}
                        dragConfig={
                            {
                                handle: ".module-header__drag-handle",
                                bounded: false,
                                enabled: canDragModules && !isPlayMode,
                            }
                        }
                        onResize={onResize}
                        resizeConfig={
                            {
                                enabled: canDragModules && !isPlayMode,
                            }
                        }
                        dropConfig={{ enabled: true }}
                        droppingItem={{
                            i: "__dropping-elem",
                            w: MODULE_DEFINITIONS[draggingModuleType]?.defaultLayout.w ?? 1,
                            h: MODULE_DEFINITIONS[draggingModuleType]?.defaultLayout.h ?? 1,
                        }}
                        compactor={verticalCompactor}
                        positionStrategy={positionStrategy}
                        className="dashboard-grid-layout"
                        style={{ position: "relative", zIndex: 2, minHeight: GRID_HEIGHT }}
                    >
                        {renderModules()}
                    </ReactGridLayout>
                </div>
            </ZoomPanPinchWrapper>
            <EditModal
                open={editingModuleId !== null}
                onClose={() => setEditingModuleId(null)}
                onSave={onSaveSettings}
                moduleId={editingModuleId}
            />
        </div>
        </Paper>
    );
}