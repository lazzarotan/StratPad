"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loadDashboardFromBackendToSession } from "@/client_API_calls/backend_sync/load_dashboard";
import DashboardEditor from "@/components/DashboardEditor/DashboardEditor";
import DashboardSkeleton from "@/components/DashboardSkeleton/DashboardSkeleton";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getDashboard } from "@/client_API_calls/session_storage/session_storage_utils";

export default function StratlabDashboardPage() {


    //Get the dashboard ID from the URL
    const { dashboardId } = useParams();
    const searchParams = useSearchParams();
    const initialMode = searchParams.get('mode') === 'play' ? 'play' : 'edit';
    //Success/failure
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const hasLoadedRef = useRef(false);
    
    const router = useRouter();

    const { data: session, isPending } = useSession();

    //Only load on component mount
    useEffect(() => {
        if (!dashboardId) return;

        if (isPending) return;

        if (!session) {
            if (!hasLoadedRef.current) {
                router.replace(`/stratlab/view/${dashboardId}`);
            }
            return;
        }

        let currentDashboard = null;

        try 
        {
            currentDashboard = getDashboard();
        } 
        catch (error)
        {
            currentDashboard = null;
        }

        if (currentDashboard?.dashboardId === dashboardId) {
            hasLoadedRef.current = true;
            setResult(currentDashboard);
            return;
        }

        loadDashboardFromBackendToSession(dashboardId)
            .then(data => {
                hasLoadedRef.current = true;
                setResult(data);
            })
            .catch(err => {
                if (err.message === "Unauthorized") {
                    if (!hasLoadedRef.current) {
                        router.replace(`/stratlab/view/${dashboardId}`);
                    }
                    return;
                }

                setError(err.message);
            })

    }, [dashboardId, session, isPending, router]);

    if (error) return <div>{error}</div>;

    if (!result) return <DashboardSkeleton />;

    return (
        <DashboardEditor
            initialMode={initialMode}
            canEnterEditMode={true}
            canSave={true}
            canClone={false}
        />
    );
}