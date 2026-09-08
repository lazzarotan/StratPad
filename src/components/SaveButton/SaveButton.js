"use client";

import "./SaveButton.css";
import { saveSessionToBackend } from "@/client_API_calls/backend_sync/save_dashboard";
import { getDashboard, setSessionStorage } from "@/client_API_calls/session_storage/session_storage_utils";
import { DASHBOARD_SESSION_KEY } from "@/client_API_calls/session_storage/useSession";
import { useDashboardMode } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import { useSession } from "@/lib/auth-client";
import { useAppSnackbar } from "@/components/SnackbarProvider/SnackbarProvider";
import { useState } from "react";
import LoginDialog from "@/components/LoginDialog/LoginDialog";
import { Save } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";

export default function SaveButton() {
    const { canSave } = useDashboardMode();
    const { data: session } = useSession();
    const { showSnackbar } = useAppSnackbar();
    const [loginOpen, setLoginOpen] = useState(false);

    if (!canSave) return null;

    async function handleSave() {
        if (!session) {
            setLoginOpen(true);
            return;
        }

        await save();
    }

    async function save() {
        try {
            const { dashboardId } = await saveSessionToBackend();

            const dashboard = getDashboard();
            setSessionStorage(DASHBOARD_SESSION_KEY, { ...dashboard, id: dashboardId });

            console.log("Saved dashboard:", dashboardId);
            window.dispatchEvent(new CustomEvent("stratlab:save-success"));
            showSnackbar("Dashboard saved successfully.", "success");
        } catch (err) {
            console.error("Save failed:", err);
            showSnackbar("Failed to save dashboard.", "error");
        }
    }

    return (
        <>
            <IconButton>
                <Save onClick={handleSave}/>
            </IconButton>
            <LoginDialog
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onSuccess={() => {
                    setLoginOpen(false);
                    save();
                }}
            />
        </>
    );
}
