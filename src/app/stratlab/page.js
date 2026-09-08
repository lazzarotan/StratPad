"use client";

import { useState, useEffect } from "react";
import DashboardEditor from "@/components/DashboardEditor/DashboardEditor";
import { clearSessionStorage } from "@/client_API_calls/session_storage/session_storage_utils";
import DashboardSkeleton from "@/components/DashboardSkeleton/DashboardSkeleton";
import "./Stratlab.css";

export default function Home() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        clearSessionStorage();
        setReady(true);
    }, []);

    if (!ready) return <DashboardSkeleton />;

    return (
        <DashboardEditor
            initialMode="edit"
            canEnterEditMode={true}
            canSave={true}
            canClone={false}
        />
    );
}