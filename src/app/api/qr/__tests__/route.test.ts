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

describe("GET /api/qr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const { status } = await parseResponse(await GET());
    expect(status).toBe(401);
  });

  it("returns empty array when no restaurant", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue(null);
    const { data } = await parseResponse(await GET());
    expect(data.qrCodes).toEqual([]);
  });

  it("returns QR codes list", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    const qrCodes = [{ id: "qr1", label: "Main" }];
    db.qRCode.findMany.mockResolvedValue(qrCodes);
    const { data } = await parseResponse(await GET());
    expect(data.qrCodes).toEqual(qrCodes);
  });
});

describe("POST /api/qr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = createRequest("/api/qr", {
      method: "POST",
      body: { menuId: "m1", label: "Test" },
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(401);
  });

  it("returns 403 when tier limit reached", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    mockTierCheck.mockResolvedValue({ allowed: false, message: "Limit reached" });
    const req = createRequest("/api/qr", {
      method: "POST",
      body: { menuId: "m1", label: "Test" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(403);
    expect(data.tierLimit).toBe(true);
  });

  it("returns 201 on success", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    mockTierCheck.mockResolvedValue({ allowed: true });
    db.menu.findFirst.mockResolvedValue({
      id: "m1",
      restaurant: { slug: "my-restaurant" },
    });
    db.qRCode.create.mockResolvedValue({ id: "qr-new" });
    db.qRCode.update.mockResolvedValue({
      id: "qr-new",
      label: "Test",
      menuUrl: "http://localhost:3000/menu/my-restaurant?menu=m1&qr=qr-new",
    });

    const req = createRequest("/api/qr", {
      method: "POST",
      body: { menuId: "m1", label: "Test" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(201);
    expect(data.qrCode.id).toBe("qr-new");
  });
});
