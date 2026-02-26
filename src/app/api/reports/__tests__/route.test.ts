import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db");
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { GET } from "../route";
import { createRequest, parseResponse, sessions } from "@/__tests__/helpers";

const db = prisma as any;
const mockGetSession = getServerSession as ReturnType<typeof vi.fn>;

describe("GET /api/reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = createRequest("/api/reports?type=scans");
    const { status } = await parseResponse(await GET(req));
    expect(status).toBe(401);
  });

  it("returns 404 when no restaurant", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue(null);
    const req = createRequest("/api/reports?type=scans");
    const { status, data } = await parseResponse(await GET(req));
    expect(status).toBe(404);
    expect(data.error).toBe("No restaurant found");
  });

  it("returns 400 for invalid report type", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    const req = createRequest("/api/reports?type=invalid");
    const { status } = await parseResponse(await GET(req));
    expect(status).toBe(400);
  });

  it("returns CSV for scans report", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    db.scan.findMany.mockResolvedValue([
      {
        timestamp: new Date("2024-01-15T10:30:00Z"),
        deviceType: "mobile",
        city: "Riyadh",
        country: "SA",
        qrCode: { label: "QR1", menu: { name: "Lunch" } },
      },
    ]);

    const req = createRequest("/api/reports?type=scans&format=csv");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("Date");
    expect(text).toContain("mobile");
  });

  it("returns JSON for feedback with summary", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    db.customerFeedback.findMany.mockResolvedValue([
      { createdAt: new Date(), rating: 4, comment: "Good", menu: { name: "Lunch" } },
      { createdAt: new Date(), rating: 5, comment: "Great", menu: { name: "Lunch" } },
    ]);

    const req = createRequest("/api/reports?type=feedback&format=json");
    const { status, data } = await parseResponse(await GET(req));
    expect(status).toBe(200);
    expect(data.summary.averageRating).toBe(4.5);
    expect(data.summary.total).toBe(2);
    expect(data.headers).toContain("Rating (1-5)");
  });

  it("returns JSON for items with categories", async () => {
    mockGetSession.mockResolvedValue(sessions.owner);
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    db.menuItem.findMany.mockResolvedValue([
      {
        name: "Latte",
        nameAr: null,
        price: 20,
        currency: "SAR",
        availability: "AVAILABLE",
        allergens: ["milk"],
        dietaryTags: [],
        isSpecial: false,
        category: { name: "Drinks", menu: { name: "Cafe" } },
        variants: [],
      },
    ]);

    const req = createRequest("/api/reports?type=items&format=json");
    const { status, data } = await parseResponse(await GET(req));
    expect(status).toBe(200);
    expect(data.summary.total).toBe(1);
    expect(data.summary.categoriesCount).toBe(1);
    expect(data.rows[0]).toContain("Latte");
  });
});
