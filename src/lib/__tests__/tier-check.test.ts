import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db");

import { prisma } from "@/lib/db";
import { checkTierLimit, getTierForUser } from "../tier-check";

const db = prisma as unknown as {
  subscription: { findUnique: ReturnType<typeof vi.fn> };
  restaurant: { findUnique: ReturnType<typeof vi.fn> };
  menu: { count: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
  menuItem: { count: ReturnType<typeof vi.fn> };
  qRCode: { count: ReturnType<typeof vi.fn> };
  location: { count: ReturnType<typeof vi.fn> };
};

describe("getTierForUser", () => {
  it("returns FREE when no subscription exists", async () => {
    db.subscription.findUnique.mockResolvedValue(null);
    expect(await getTierForUser("user-1")).toBe("FREE");
  });

  it("returns the subscription tier when one exists", async () => {
    db.subscription.findUnique.mockResolvedValue({ tier: "PRO" });
    expect(await getTierForUser("user-1")).toBe("PRO");
  });
});

describe("checkTierLimit", () => {
  beforeEach(() => {
    db.subscription.findUnique.mockResolvedValue(null); // FREE by default
  });

  it("allows when no restaurant exists (new user)", async () => {
    db.restaurant.findUnique.mockResolvedValue(null);
    const result = await checkTierLimit("user-1", "menus");
    expect(result.allowed).toBe(true);
    expect(result.current).toBe(0);
  });

  it("allows when under limit", async () => {
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    db.menu.count.mockResolvedValue(0);
    const result = await checkTierLimit("user-1", "menus");
    expect(result.allowed).toBe(true);
  });

  it("denies when at limit and returns message", async () => {
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    db.menu.count.mockResolvedValue(1); // FREE limit is 1
    const result = await checkTierLimit("user-1", "menus");
    expect(result.allowed).toBe(false);
    expect(result.message).toContain("menus");
    expect(result.message).toContain("FREE");
  });

  it("counts QR codes correctly", async () => {
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    db.qRCode.count.mockResolvedValue(1); // FREE limit is 1
    const result = await checkTierLimit("user-1", "qrCodes");
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(1);
    expect(result.current).toBe(1);
  });

  it("PRO tier always allows (Infinity)", async () => {
    db.subscription.findUnique.mockResolvedValue({ tier: "PRO" });
    db.restaurant.findUnique.mockResolvedValue({ id: "rest-1" });
    db.menu.count.mockResolvedValue(999);
    const result = await checkTierLimit("user-1", "menus");
    expect(result.allowed).toBe(true);
    expect(result.tier).toBe("PRO");
  });
});
