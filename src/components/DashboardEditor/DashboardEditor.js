"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Dashboard from "@/components/Dashboard/Dashboard";
import {useSession} from "@/client_API_calls/session_storage/useSession";
import { DASHBOARD_SESSION_KEY, PAGE_SESSION_KEY, MODULE_SESSION_PREFIX } from "@/client_API_calls/session_storage/useSession";
import { generateUUID } from "@/components/Dashboard/moduleFactory";
import { DashboardModeProvider } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import DashboardFooter from "@/components/DashboardFooter/DashboardFooter";
import "@/app/stratlab/Stratlab.css";
import { clearSessionStorage } from "@/client_API_calls/session_storage/session_storage_utils";

const STRATLAB_DIRTY_FLAG_KEY = "stratlab:isDirty";

export default function DashboardEditor({
    initialMode = "edit",
    canEnterEditMode = true,
    canSave = true,
    canClone = false,
}) {
    const [activePage, setActivePage] = useState(0);
    const [pages, setPages] = useSession(PAGE_SESSION_KEY, DEFAULT_STATES.pages)


    const [dashboardMetadata, setDashboardMetadata] = useSession(DASHBOARD_SESSION_KEY, DEFAULT_STATES.dashboardMetadata)

    // Tracks which module is being dragged
    const [draggingModuleType, setDraggingModuleType] = useState(null) 

    const [isDashboardLoading, setIsDashboardLoading] = useState(false);

    // Mode state. default is edit
    const [mode, setMode] = useState(initialMode);

    const [baselineSnapshot, setBaselineSnapshot] = useState(null);
    const [sessionSnapshotTick, setSessionSnapshotTick] = useState(0);
    const shouldClearSessionOnPageHideRef = useRef(false);

    function getAllModuleSessionData() {
        if (typeof window === "undefined") return {};

        const moduleData = {};

        Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith(MODULE_SESSION_PREFIX)) {
                moduleData[key] = JSON.parse(sessionStorage.getItem(key));
            }
        });

        return moduleData;
    }

    // Current snapshot includes dashboard metadata, pages, and module session data
    const currentSnapshot = useMemo(() => {
        return JSON.stringify({
            dashboardMetadata,
            pages,
            moduleData: getAllModuleSessionData(),
        });
    }, [dashboardMetadata, pages, sessionSnapshotTick]);

    // Dirty means current session state differs from the last clean baseline
    const isDirty =
        canSave &&
        baselineSnapshot !== null &&
        currentSnapshot !== baselineSnapshot;

    function handleToggleMode() {

        if (!canEnterEditMode) return;

        setMode((prevMode) => (prevMode === "edit" ? "play" : "edit"));

    }

    // this is used when user changes tabs to allow the load screen to be shown before the page switches
    function handlePageChange(nextPage) { 
        if (nextPage === activePage) return;

        setIsDashboardLoading(true);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setActivePage(nextPage);
            });
        });
    }

    const isEditMode = mode === "edit";

    useEffect(() => {
        if (!canSave) return;

        // Set the initial baseline only once, when editor state is available
        if (baselineSnapshot === null) {
            setBaselineSnapshot(currentSnapshot);
        }
    }, [baselineSnapshot, currentSnapshot]);

    useEffect(() => {
        if (!canSave) return;

        function handleSaveSuccess() {
            setBaselineSnapshot(currentSnapshot);
        }

        window.addEventListener("stratlab:save-success", handleSaveSuccess);

        return () => {
            window.removeEventListener("stratlab:save-success", handleSaveSuccess);
        };
    }, [currentSnapshot]);

    useEffect(() => {
        if (!canSave) return;

        function handleSessionDataChanged() {
            setSessionSnapshotTick((prev) => prev + 1);
        }

        window.addEventListener("stratlab:session-data-changed", handleSessionDataChanged);

        return () => {
            window.removeEventListener("stratlab:session-data-changed", handleSessionDataChanged);
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        sessionStorage.setItem(STRATLAB_DIRTY_FLAG_KEY, JSON.stringify(canSave && isDirty));
    }, [isDirty]);

    useEffect(() => {
        if (!canSave) return;
        
        function handleBeforeUnload(event) {
            if (!isDirty) return;

            // Mark that session should be cleared if the page actually leaves
            shouldClearSessionOnPageHideRef.current = true;

            event.preventDefault();
            event.returnValue = "";
        }

        function handlePageHide() {
            if (!shouldClearSessionOnPageHideRef.current) return;

            clearSessionStorage();
        }

        function handlePageShow() {
            // If the user canceled leaving and stayed on the page,
            // reset the flag so session is not cleared accidentally later
            shouldClearSessionOnPageHideRef.current = false;
        }

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("pagehide", handlePageHide);
        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("pagehide", handlePageHide);
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, [isDirty]);

    return (
        <DashboardModeProvider
            mode={mode}
            canEnterEditMode={canEnterEditMode}
            canSave={canSave}
            canClone={canClone}
        >
            <div className="app-wrapper">
                <div className="app-layout">
                    <Sidebar 
                        dashboardMetadata={dashboardMetadata} 
                        setDashboardMetadata={setDashboardMetadata}
                        onModuleDragStart={(moduleType) => setDraggingModuleType(moduleType)}
                        onModuleDragEnd={() => setDraggingModuleType(null)} 
                     />
                    <div className="main-content">
                        <DashboardFooter
                        activePage={activePage}
                        pages={pages}
                        setPages={setPages}
                        setActivePage={handlePageChange}
                        isEditMode={isEditMode}
                        handleToggleMode={handleToggleMode}
                        canEnterEditMode={canEnterEditMode}
                        dashboardMetadata={dashboardMetadata}
                        />
                        <Dashboard 
                            activePage={activePage} 
                            pages={pages} 
                            setPages={setPages} 
                            draggingModuleType={draggingModuleType}   // Passing dragging type to control ghost preview size
                            isDashboardLoading={isDashboardLoading}
                            setIsDashboardLoading={setIsDashboardLoading}
                        />
                    </div>
                </div>
            </div>
        </DashboardModeProvider>
    );
}

const DEFAULT_STATES = {
  dashboardMetadata: {
    dashboardId: generateUUID(), // when a dashboard is saved it'll get its id from the db
    title: "dashboard",
    description: null,
    isPublic: false,
  },
  pages: [
    {
      pageId: generateUUID(),
      name: "Page 1",
      index: 0,
      modules: [],
    },
  ],
};