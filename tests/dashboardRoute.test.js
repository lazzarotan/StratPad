import { describe, it, expect, vi, beforeEach } from "vitest";

// Create mocks that will be hoisted alongside vi.mock
const { mockPrisma, mockGetSession } = vi.hoisted(() => ({
    mockPrisma: {
        dashboard: {
            findUnique: vi.fn(),
        },
    },
    mockGetSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
    prisma: mockPrisma,
}));

vi.mock("@/lib/auth", () => ({
    auth: {
        api: {
            getSession: mockGetSession,
        },
    },
}));

vi.mock("next/headers", () => ({
    headers: vi.fn(() => ({})),
}));

vi.mock("@/generated/prisma", () => ({
    ModuleType: {},
}));

vi.mock("@/app/api/dashboards/[dashboardId]/with-content/saveDashboardFromSession", () => ({
    saveDashboardFromSession: vi.fn(),
}));

import { GET, POST } from "@/app/api/dashboards/[dashboardId]/with-content/route";

beforeEach(() => {
    vi.clearAllMocks();
});

describe("GET /api/dashboards/[dashboardId]/with-content", () => {

    it("should reject a non-owner from reading a private dashboard", async () => {
        // Alice's private dashboard exists in the DB
        mockPrisma.dashboard.findUnique.mockResolvedValueOnce({
            dashboardId: "dash-1",
            ownerId: "alice-123",
            isPublic: false,
        });

        //Bob is logged in
        mockGetSession.mockResolvedValueOnce({
            user: { id: "bob-456"},
        });

        const request = new Request("http://localhost/api/dashboards/dash-1/with-content");
        const response = await GET(request, { params: Promise.resolve({ dashboardId: "dash-1"})});

        expect(response.status).toBe(401);
    });

    it("should allow the owner to read their private dashboard", async () => {
        // Alice's private dashboard
        const dashboardData = {
            dashboardId: "dash-1",
            ownerId: "alice-123",
            isPublic: false,
            pages: [],
        };

        // First findUnique call returns the dashboard
        mockPrisma.dashboard.findUnique.mockResolvedValueOnce(dashboardData);
        // Alice is logged in
        mockGetSession.mockResolvedValueOnce({
            user: { id: "alice-123"},
        });
        // Second findUnique call retuns the dashboard
        mockPrisma.dashboard.findUnique.mockResolvedValueOnce(dashboardData);

        const request = new Request("http://localhost/api/dashboards/dash-1/with-content");
        const response = await GET(request, { params: Promise.resolve({ dashboardId: "dash-1" })});

        expect(response.status).toBe(200);
    });

    it("should allow anyone to read a public dashboard", async () => {
        const dashboardData = {
            dashboardId: "dash-1",
            ownerId: "alice-123",
            isPublic: true,
            pages: [],
        };

        mockPrisma.dashboard.findUnique.mockResolvedValueOnce(dashboardData);
        // No session because we are not logged in
        mockGetSession.mockResolvedValueOnce(null);
        mockPrisma.dashboard.findUnique.mockResolvedValueOnce(dashboardData);

        const request = new Request("http://localhost/api/dashboards/dash-1/with-content");
        const response = await GET(request, { params: Promise.resolve({ dashboardId: "dash-1" })});

        expect(response.status).toBe(200);
    });

    it("should reject saving when not logged in", async () => {
        // No session
        mockGetSession.mockResolvedValueOnce(null);

        const request = new Request("http://localhost/api/dashboards/dash-1/with-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dashboard: {}, pages: [], moduleData: [] }),
        });

        const response = await POST(request, { params: Promise.resolve({
            dashboardId: "dash-1"
        }) });

        expect(response.status).toBe(401);
    });

    it("should return 404 when dashboard does not exist", async () => {
        mockPrisma.dashboard.findUnique.mockResolvedValueOnce(null);

        const request = new Request("http://localhost/api/dashboards/fake-id/with-content");
        const response = await GET(request, {params: Promise.resolve({ dashboardId: "fake-id"}) });

        expect(response.status).toBe(404);
    });
});