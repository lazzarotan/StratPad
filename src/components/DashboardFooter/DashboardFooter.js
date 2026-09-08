"use client";

import { useState, useEffect } from "react";
import PageTabs from "@/components/PageTabs/PageTabs";
import "./DashboardFooter.css";
import { useDashboardMode } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import { useSession } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { generateUUID } from "@/components/Dashboard/moduleFactory";
import { useAppSnackbar } from "@/components/SnackbarProvider/SnackbarProvider";
import SaveButton from "@/components/SaveButton/SaveButton";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import PlayIcon from "@mui/icons-material/PlayArrow";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloneButton from "@/components/CloneButton/CloneButton";
import LoginDialog from "@/components/LoginDialog/LoginDialog";

export default function DashboardFooter({
    activePage,
    setActivePage,
    pages,
    setPages,
    isEditMode,
    handleToggleMode,
    canEnterEditMode,
    dashboardMetadata,
}) {

    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent("stratlab:toolbar-collapse", { detail: { collapsed: isCollapsed } }));
    }, [isCollapsed]);
    const [loginOpen, setLoginOpen] = useState(false);
    const { canClone } = useDashboardMode();
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();

    const { showSnackbar } = useAppSnackbar();

    async function cloneDashboard() {
        const sourceDashboardId = params?.dashboardId;

        if (!sourceDashboardId) return;

        try {
            const response = await fetch(`/api/dashboards/${sourceDashboardId}/clone`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dashboardId: generateUUID(),
                    newTitle: `copy-${dashboardMetadata?.title ?? "dashboard"}`,
                    newDescription: dashboardMetadata?.description ?? null,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                showSnackbar(errorText || "Failed to clone dashboard", "error");
                return;
            }

            const data = await response.json();

            showSnackbar("Dashboard cloned successfully.", "success");

            router.push(`/stratlab/${data.dashboardId}`);
        } catch (err) {
            console.error("Clone failed:", err);
            showSnackbar("Failed to clone dashboard.", "error");
        }
    }

    async function handleClone() {
        if (!session) {
            setLoginOpen(true);
            return;
        }

        await cloneDashboard();
    }

    return (
        <>
        <LoginDialog
            open={loginOpen}
            onClose={() => setLoginOpen(false)}
            onSuccess={() => {
                setLoginOpen(false);
                cloneDashboard();
            }}
            title="Login to clone"
            subtitle="Sign in to your account to clone this dashboard."
        />
        <div className="dashboard-footer-shell">
            {isCollapsed && (
                <div className="dashboard-footer-shell__toggle">
                    <IconButton
                        size="small"
                        aria-label="Expand toolbar"
                        onClick={() => setIsCollapsed(false)}
                    >
                        <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                </div>
            )}

            <Collapse in={!isCollapsed} collapsedSize={0}>
                <Paper>
                    <div className="dashboard-footer">
                        <div className="dashboard-footer__left">
                            <IconButton
                                size="small"
                                aria-label="Collapse toolbar"
                                onClick={() => setIsCollapsed(true)}
                            >
                                <ExpandLessIcon fontSize="small" />
                            </IconButton>
                            {canEnterEditMode && (
                                <IconButton onClick={handleToggleMode}>
                                    {isEditMode ? <PlayIcon /> : <EditIcon />}
                                </IconButton>
                            )}
                            {canClone ? <CloneButton onClick={handleClone} /> : <SaveButton />}
                        </div>

                        <Divider orientation="vertical" variant="middle" flexItem sx={{ margin: "0 8px" }} />

                        <div className="dashboard-footer__center">
                            <PageTabs
                                style={{ margin: 0 }}
                                activePage={activePage}
                                pages={pages}
                                setPages={setPages}
                                setActivePage={setActivePage}
                            />
                        </div>
                    </div>
                </Paper>
            </Collapse>
        </div>
        </>
    );
}