import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db");
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { GET } from "../route";
import { createRequest, parseResponse, sessions } from "@/__tests__/helpers";

const db = prisma as any;
const mockRequireAdmin = requireAdmin as ReturnType<typeof vi.fn>;

describe("GET /api/admin/reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAdmin.mockResolvedValue({ error: "Unauthorized", status: 401, session: null });
    const req = createRequest("/api/admin/reports?type=restaurants");
    const { status } = await parseResponse(await GET(req));
    expect(status).toBe(401);
  });

  it("returns 403 when not admin", async () => {
    mockRequireAdmin.mockResolvedValue({ error: "Forbidden", status: 403, session: null });
    const req = createRequest("/api/admin/reports?type=restaurants");
    const { status } = await parseResponse(await GET(req));
    expect(status).toBe(403);
  });

  it("returns CSV for restaurants report", async () => {
    mockRequireAdmin.mockResolvedValue({ error: null, status: null, session: sessions.admin });
    db.restaurant.findMany.mockResolvedValue([
      {
        name: "Test Restaurant",
        nameAr: null,
        slug: "test-restaurant",
        owner: { email: "owner@test.com" },
        phone: "555-0000",
        menus: [],
        _count: { menus: 2 },
        createdAt: new Date("2024-01-01"),
      },
    ]);

    const req = createRequest("/api/admin/reports?type=restaurants&format=csv");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("Test Restaurant");
  });

  it("returns JSON for subscriptions with revenue", async () => {
    mockRequireAdmin.mockResolvedValue({ error: null, status: null, session: sessions.admin });
    db.subscription.findMany.mockResolvedValue([
      {
        tier: "BASIC",
        status: "ACTIVE",
        priceAmount: 29.57,
        vatAmount: 4.43,
        currentPeriodStart: new Date("2024-01-01"),
        currentPeriodEnd: new Date("2024-02-01"),
        createdAt: new Date("2024-01-01"),
        user: { email: "user@test.com", restaurant: { name: "My Place" } },
      },
      {
        tier: "PRO",
        status: "ACTIVE",
        priceAmount: 94.78,
        vatAmount: 14.22,
        currentPeriodStart: new Date("2024-01-01"),
        currentPeriodEnd: null,
        createdAt: new Date("2024-01-01"),
        user: { email: "pro@test.com", restaurant: { name: "Pro Place" } },
      },
    ]);

    const req = createRequest("/api/admin/reports?type=subscriptions&format=json");
    const { status, data } = await parseResponse(await GET(req));
    expect(status).toBe(200);
    expect(data.summary.total).toBe(2);
    expect(data.summary.totalRevenue).toBeCloseTo(124.35, 2);
    expect(data.summary.tierBreakdown.BASIC).toBe(1);
    expect(data.summary.tierBreakdown.PRO).toBe(1);
  });
});
