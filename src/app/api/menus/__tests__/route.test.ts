import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db");
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/tier-check", () => ({
  checkTierLimit: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { checkTierLimit } from "@/lib/tier-check";
import { GET, POST } from "../route";
import { createRequest, parseResponse, sessions } from "@/__tests__/helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as unknown as Record<string, Record<string, any>>;
const mockGetSession = getServerSession as ReturnType<typeof vi.fn>;
const mockTierCheck = checkTierLimit as ReturnType<typeof vi.fn>;

describe("GET /api/menus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const { status, data } = await parseResponse(await GET());
    expect(status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns empty array when no restaurant", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue(null);
    const { status, data } = await parseResponse(await GET());
    expect(status).toBe(200);
    expect(data.menus).toEqual([]);
  });

  it("returns menus list", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    const menus = [{ id: "m1", name: "Lunch" }];
    db.menu.findMany.mockResolvedValue(menus);
    const { status, data } = await parseResponse(await GET());
    expect(status).toBe(200);
    expect(data.menus).toEqual(menus);
  });
});

describe("POST /api/menus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = createRequest("/api/menus", {
      method: "POST",
      body: { name: "Test" },
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(401);
  });

  it("returns 403 when tier limit reached", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    mockTierCheck.mockResolvedValue({
      allowed: false,
      message: "Limit reached",
    });
    const req = createRequest("/api/menus", {
      method: "POST",
      body: { name: "Test" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(403);
    expect(data.tierLimit).toBe(true);
  });

  it("creates restaurant if none exists", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue(null);
    db.user.findUnique.mockResolvedValue({ name: "Owner" });
    db.restaurant.create.mockResolvedValue({ id: "new-rest" });
    mockTierCheck.mockResolvedValue({ allowed: true });
    db.menu.create.mockResolvedValue({ id: "m1", name: "Test" });

    const req = createRequest("/api/menus", {
      method: "POST",
      body: { name: "Test" },
    });
    await POST(req);
    expect(db.restaurant.create).toHaveBeenCalled();
  });

  it("returns 201 with menu on success", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    mockTierCheck.mockResolvedValue({ allowed: true });
    const menu = { id: "m1", name: "Lunch", categories: [] };
    db.menu.create.mockResolvedValue(menu);

    const req = createRequest("/api/menus", {
      method: "POST",
      body: { name: "Lunch", categories: [] },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(201);
    expect(data.menu.id).toBe("m1");
  });

  it("returns 500 on error", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockRejectedValue(new Error("fail"));

    const req = createRequest("/api/menus", {
      method: "POST",
      body: { name: "Test" },
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(500);
  });
});
