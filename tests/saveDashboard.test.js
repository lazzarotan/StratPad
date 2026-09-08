import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Prisma client
vi.mock("@/lib/prisma", () => ({
    prisma: {
      $transaction: vi.fn((callback) => callback(mockTx)),
    },
}));

// Fake transaction with mock upsert/deleteMany
const mockTx = {
    dashboard: { findUnique: vi.fn(), upsert: vi.fn() },
    page: { findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    module: { findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    notesModule: { upsert: vi.fn() },
    stopwatchModule: { upsert: vi.fn() },
    coinTossModule: { upsert: vi.fn() },
    diceModule: { upsert: vi.fn() },
    counterModule: { upsert: vi.fn() },
    scoreTableModule: { upsert: vi.fn() },
    singleImageModule: { upsert: vi.fn() },
    spinWheelModule: { upsert: vi.fn() },
    nestedDictionaryModule: { upsert: vi.fn() },
    resourceBarModule: { upsert: vi.fn() },
    listModule: { upsert: vi.fn() },
};

// Mock fs so the debug file write doesn't hit disk
vi.mock("fs", () => ({
    default: { writeFileSync: vi.fn() },
    writeFileSync: vi.fn(),
}));

import { saveDashboardFromSession } from "@/app/api/dashboards/[dashboardId]/with-content/saveDashboardFromSession";
import { ModuleType } from "@/generated/prisma";


function makePayload(overrides = {}) {
    return {
        dashboard: {
            dashboardId: "dashboard-1",
            title: "Test Dashboard",
            description: "A test",
            isPublic: false,
            ...overrides.dashboard,
        },
        pages: overrides.pages ?? [
            {
                pageId: "page-1",
                name: "Page 1",
                index: 0,
                modules: [],
            },
        ],
        moduleData: overrides. moduleData ?? [],
    };
}

describe("saveDashboardFromSession", () => {

    beforeEach(() => {
        vi.clearAllMocks();

        mockTx.dashboard.findUnique.mockResolvedValue(null);
        mockTx.page.findUnique.mockResolvedValue(null);
        mockTx.module.findUnique.mockResolvedValue(null);
    });

    it("should create a dashboard with the correct ownerId", async () => {
      const payload = makePayload();

      await saveDashboardFromSession({ ownerId: "alice-123", payload });

      // Check what was passed to dashboard.upsert
      const call = mockTx.dashboard.upsert.mock.calls[0][0];

      // The create block should have Alice's ownerId
      expect(call.create.ownerId).toBe("alice-123");
    });

    // This will test the ownership bug that I came across
    it("should throw Forbidden and not upsert when a different user tries to overwrite an existing dashboard", async () => {
        const payload = makePayload();

        mockTx.dashboard.findUnique.mockResolvedValue({
            ownerId: "bob-456",
        });

        await expect(
            saveDashboardFromSession({ ownerId: "alice-123", payload })
        ).rejects.toThrow("Forbidden");

        expect(mockTx.dashboard.upsert).not.toHaveBeenCalled();
    });

    it("should reject a payload with no dashboard object", async () => {
        await expect(
            saveDashboardFromSession({ ownerId: "alice-123", payload: { pages: []} })
        ).rejects.toThrow("Invalid payload");
    });

    it("should reject a payload with no pages array", async () => {
        await expect(
            saveDashboardFromSession({
                ownerId: "alice-123",
                payload: { dashboard: { dashboardId: "d1", title: "x", description: null, isPublic: false } },
            })
        ).rejects.toThrow("Invalid payload");
    });

    it("should save a notes module with correct data", async () => {
        const payload = makePayload({
            pages: [
                {
                    pageId: "page-1",
                    name: "Page 1",
                    index: 0,
                    modules: [
                        { moduleId: "mod-1", moduleType: "notes", x: 0, y: 0, w: 4, h:3, minW: 2, minH: 2, maxW: 12, maxH: 9 },
                    ],
                },
            ],
            moduleData: [
                { moduleId: "mod-1", moduleType: "notes", title: "My Notes", text: "This is a test"},
            ],
        });

        await saveDashboardFromSession({ ownerId: "alice-123", payload });

        const call = mockTx.notesModule.upsert.mock.calls[0][0];
        expect(call.create.title).toBe("My Notes");
        expect(call.create.text).toBe("This is a test");
    });

    it("should reject an invalid module type", async () => {
        const payload = makePayload({
            pages: [
                {
                    pageId: "page-1",
                    name: "Page 1",
                    index: 0,
                    modules: [
                        { moduleId: "mod-1", moduleType: "hacker", x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2, maxW: 12, maxH: 9 },
                    ],
                },
            ],
            moduleData: [
                { moduleId: "mod-1", moduleType: "hacker" },
            ],
        });

        await expect(
            saveDashboardFromSession({ ownerId: "alice-123", payload })
        ).rejects.toThrow("Invalid moduleType");
    });

    it("should delete pages that were removed", async () => {
        const payload = makePayload({
            pages: [
                { pageId: "page-2", name: "Only Page", index: 0, modules: [] },
            ],
        });

        await saveDashboardFromSession({ ownerId: "alice-123", payload });

        const call = mockTx.page.deleteMany.mock.calls[0][0];
        // Should delete all pages NOT in the incoming list
        expect(call.where.dashboardId).toBe("dashboard-1");
        expect(call.where.pageId.notIn).toEqual(["page-2"]);
    });

    it("should delete modules that were removed from a page", async() => {
        const payload = makePayload({
            pages: [
                {
                    pageId: "page-1",
                    name: "Page 1",
                    index: 0,
                    modules: [
                        {
                            moduleId: "mod-2",
                            moduleType: "notes", x: 0, y: 0, w: 4, h: 3, 
                                                minW: 2, minH: 2, 
                                                maxW: 12, maxH: 9
                        },
                    ],
                },
            ],
            moduleData: [
                {
                    moduleId: "mod-2", moduleType: "notes", title: "Keep", text: ""
                },
            ],
        });

        await saveDashboardFromSession({ ownerId: "alice-123", payload });
        const call = mockTx.module.deleteMany.mock.calls[0][0];

        expect(call.where.pageId).toBe("page-1");
        expect(call.where.moduleId.notIn).toEqual(["mod-2"]);
    });

    it("should reject a payload with no dashboardId", async () => {
        const payload = makePayload({
            dashboard: { dashboardId: null, 
                title: "Test", 
                description: null, 
                isPublic: false 
            },
        });

        await expect(saveDashboardFromSession({ ownerId: "alice-123", payload})).rejects.toThrow("Dashboard ID is required");
    });

    it("should save a counter module with defaults when data is missing", async () => {
        const payload = makePayload({
            pages: [
                {
                    pageId: "page-1",
                    name: "Page 1",
                    index: 0,
                    modules: [
                        { moduleId: "mod-1", moduleType: "counter", x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxW: 6, maxH: 4 },
                    ],
                },
            ],
            moduleData: [
                { moduleId: "mod-1", moduleType: "counter" },
            ],
        });

        await saveDashboardFromSession({ ownerId: "alice-123", payload });

        const call = mockTx.counterModule.upsert.mock.calls[0][0];
        expect(call.create.title).toBe("Counter");
        expect(call.create.value).toBe(0);
        expect(call.create.increment).toBe(1);
        expect(call.create.prefix).toBe("");
        expect(call.create.suffix).toBe("");
    });
});