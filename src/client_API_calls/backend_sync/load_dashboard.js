import { MODULE_SESSION_PREFIX, DASHBOARD_SESSION_KEY, PAGE_SESSION_KEY } from "../session_storage/useSession";
import { setSessionStorage } from "../session_storage/session_storage_utils";

//Retrieve the dashboard from backend and load it into session storage
//Errors bubble up to the caller.
export async function loadDashboardFromBackendToSession(dashboardId) {
    const data = await loadDashboardFromBackend(dashboardId);
    addDashboardToSession(data);
    return data;
}

//Retrieve the dashboard from backend
async function loadDashboardFromBackend(dashboardId){
    const res = await fetch(`/api/dashboards/${dashboardId}/with-content`);

    if (res.status === 401) {
        throw new Error("Unauthorized");
    }

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(`Server returned invalid JSON (${res.status})`);
    }

    if (!data.success) {
        throw new Error(data.error ?? `Load failed (${res.status})`);
    }

    return data;
}

//Load the dashboard into session storage
function addDashboardToSession(data){
    setSessionStorage(DASHBOARD_SESSION_KEY, data.dashboard);
    setSessionStorage(PAGE_SESSION_KEY, data.pages.map((page) => ({
        ...page,
        modules: page.modules.map((mod) => ({
            ...mod,
            i: mod.moduleId,
        })),
    })));

    data.moduleData.forEach(mod => {
        setSessionStorage(MODULE_SESSION_PREFIX + mod.moduleId, mod);
    });
    return data;
}