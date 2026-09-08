"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { loadDashboardFromBackendToSession } from "@/client_API_calls/backend_sync/load_dashboard";
import { clearSessionStorage } from "@/client_API_calls/session_storage/session_storage_utils";
import DashboardEditor from "@/components/DashboardEditor/DashboardEditor";
import DashboardSkeleton from "@/components/DashboardSkeleton/DashboardSkeleton";

export default function StratlabViewDashboardPage() {


    //Get the dashboard ID from the URL
    const { dashboardId } = useParams();
    //Success/failure
    const [result, setResult] = useState(null);

    //Only load on component mount
    useEffect(() => {
        if (!dashboardId) return;

        clearSessionStorage();

        loadDashboardFromBackendToSession(dashboardId)
            .then(data => setResult(data))

    }, [dashboardId]);

    if (!result) return <DashboardSkeleton />;

    return (
        <DashboardEditor
            initialMode="play"
            canEnterEditMode={false}
            canSave={false}
            canClone={true}
        />
    );
}