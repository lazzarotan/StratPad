import { getDashboard, getPages, getModuleData } from "../session_storage/session_storage_utils";



function buildSavePayload() {
  //Load in dashboard from session storage
  const dashboard = getDashboard();
  //Load in pages from session storage
  const pages = getPages();

  let moduleIds = [];

  console.log("Dashboard:", dashboard)

  //Build payload
  return {
    dashboard: {
      dashboardId: dashboard.dashboardId ?? null,
      title: dashboard.title ?? "Untitled Dashboard",
      description: dashboard.description ?? null,
      isPublic: !!dashboard.isPublic,
    },
    pages: pages.map((page, pageIndex) => ({
      pageId: page.pageId,
      name: page.name ?? `Page ${pageIndex + 1}`,
      index: Number.isFinite(page.index) ? page.index : pageIndex,
      modules: (page.modules ?? []).map((m, moduleIndex) => {
        if (!m.moduleType) {
          throw new Error(`Missing moduleType for module i=${m.i}`);
        }

        moduleIds.push(m.i);

        return {
          moduleId: m.i,
          moduleType: m.moduleType,
          index: m.index,
          x: m.x,
          y: m.y,
          w: m.w,
          h: m.h,
        };
      }),
    })),
    moduleData: moduleIds.map((id) => getModuleData(id)),
  };
}

//Call SaveToBackend()
export async function saveSessionToBackend() {
  const payload = buildSavePayload();

  const res = await fetch(`/api/dashboards/${payload.dashboard.dashboardId}/with-content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");

    throw new Error(`Save failed (${res.status}): ${msg}`);
  }

  return await res.json();
}