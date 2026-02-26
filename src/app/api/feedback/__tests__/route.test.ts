import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db");

import { prisma } from "@/lib/db";
import { POST, GET } from "../route";
import { createRequest, parseResponse } from "@/__tests__/helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as unknown as Record<string, Record<string, any>>;

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when fields are missing", async () => {
    const req = createRequest("/api/feedback", {
      method: "POST",
      body: { menuId: "m1" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toContain("rating");
  });

  it("returns 400 when rating is out of range", async () => {
    const req = createRequest("/api/feedback", {
      method: "POST",
      body: { menuId: "m1", rating: 6 },
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(400);
  });

  it("returns 404 when menu not found", async () => {
    db.menu.findUnique.mockResolvedValue(null);
    const req = createRequest("/api/feedback", {
      method: "POST",
      body: { menuId: "missing", rating: 4 },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(404);
    expect(data.error).toBe("Menu not found");
  });

  it("returns 201 on success", async () => {
    db.menu.findUnique.mockResolvedValue({
      id: "m1",
      restaurant: { ownerId: "owner-1" },
    });
    const feedback = { id: "fb-1", rating: 5, comment: "Amazing" };
    db.customerFeedback.create.mockResolvedValue(feedback);

    const req = createRequest("/api/feedback", {
      method: "POST",
      body: { menuId: "m1", rating: 5, comment: "Amazing" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(201);
    expect(data.feedback.rating).toBe(5);
  });
});

describe("GET /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns feedback list with averageRating", async () => {
    db.customerFeedback.findMany.mockResolvedValue([
      { id: "fb-1", rating: 4, comment: "Good", createdAt: new Date() },
      { id: "fb-2", rating: 5, comment: "Great", createdAt: new Date() },
    ]);

    const req = createRequest("/api/feedback?menuId=m1");
    const { status, data } = await parseResponse(await GET(req));
    expect(status).toBe(200);
    expect(data.feedback).toHaveLength(2);
    expect(data.averageRating).toBe(4.5);
    expect(data.total).toBe(2);
  });
});
