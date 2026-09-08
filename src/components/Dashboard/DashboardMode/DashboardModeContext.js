"use client";

import { createContext, useContext, useMemo } from "react";

const DashboardModeContext = createContext(null);

// Provides dashboard mode state and UI permissions to all children
export function DashboardModeProvider({

    mode,
    canEnterEditMode,
    canSave,
    canClone,
    children,

}) {

    const currentMode = mode === "play" ? "play" : "edit";

    const value = useMemo(() => {
        const isEditMode = currentMode === "edit";
        const isPlayMode = currentMode === "play";

        return {

            mode: currentMode,
            isEditMode,
            isPlayMode,

            canEnterEditMode: !!canEnterEditMode,
            canSave: !!canSave,
            canClone: !!canClone,

            showSidebar: isEditMode,
            showGrid: isEditMode,
            showModuleShadow: isEditMode,
            canDragModules: isEditMode,
            canDropModules: isEditMode,
            canDeleteModules: isEditMode,
            canRenameDashboard: isEditMode,
            canAddPages: isEditMode,
            canOpenSettings: isEditMode,

        };
    }, [currentMode, canEnterEditMode, canSave, canClone]);

    return (

        <DashboardModeContext.Provider value={value}>
            {children}
        </DashboardModeContext.Provider>

    );
}

// Custom hook to access dashboard mode context safely
export function useDashboardMode() {

    const context = useContext(DashboardModeContext);

    if (!context) {
        return {
            mode: "edit",
            isEditMode: true,
            isPlayMode: false,
            canEnterEditMode: true,
            canSave: true,
            canClone: false,
            showSidebar: true,
            showGrid: true,
            showModuleShadow: true,
            canDragModules: true,
            canDropModules: true,
            canDeleteModules: true,
            canRenameDashboard: true,
            canAddPages: true,
            canOpenSettings: true,
        };
    }

    return context;

}