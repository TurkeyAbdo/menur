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
import { parseResponse, sessions } from "@/__tests__/helpers";

const db = prisma as any;
const mockRequireAdmin = requireAdmin as ReturnType<typeof vi.fn>;

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAdmin.mockResolvedValue({ error: "Unauthorized", status: 401, session: null });
    const { status } = await parseResponse(await GET());
    expect(status).toBe(401);
  });

  it("returns 403 when not admin", async () => {
    mockRequireAdmin.mockResolvedValue({ error: "Forbidden", status: 403, session: null });
    const { status } = await parseResponse(await GET());
    expect(status).toBe(403);
  });

  it("returns stats object on success", async () => {
    mockRequireAdmin.mockResolvedValue({ error: null, status: null, session: sessions.admin });

    db.restaurant.count.mockResolvedValue(10);
    db.user.count
      .mockResolvedValueOnce(50)   // totalUsers
      .mockResolvedValueOnce(5);    // recentSignups
    db.subscription.count.mockResolvedValue(15);
    db.subscription.aggregate.mockResolvedValue({ _sum: { priceAmount: 500 } });
    db.scan.count.mockResolvedValue(1000);
    db.subscription.groupBy.mockResolvedValue([
      { tier: "FREE", _count: { tier: 30 } },
      { tier: "BASIC", _count: { tier: 10 } },
      { tier: "PRO", _count: { tier: 5 } },
    ]);
    db.user.findMany.mockResolvedValue([
      { id: "u1", name: "User 1", email: "u1@test.com", role: "OWNER", provider: "EMAIL", createdAt: new Date() },
    ]);

    const { status, data } = await parseResponse(await GET());
    expect(status).toBe(200);
    expect(data.totalRestaurants).toBe(10);
    expect(data.totalUsers).toBe(50);
    expect(data.totalScans).toBe(1000);
    expect(data.totalRevenue).toBe(500);
    expect(data.tierBreakdown.FREE).toBe(30);
    expect(data.tierBreakdown.BASIC).toBe(10);
    expect(data.recentUsers).toHaveLength(1);
  });
});
