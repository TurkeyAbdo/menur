import { describe, it, expect } from "vitest";
import { TIER_LIMITS, TIER_PRICING, getTotalPrice, TierKey } from "../tiers";

describe("TIER_LIMITS", () => {
  it("FREE tier has correct limits", () => {
    expect(TIER_LIMITS.FREE.menus).toBe(1);
    expect(TIER_LIMITS.FREE.menuItems).toBe(30);
    expect(TIER_LIMITS.FREE.qrCodes).toBe(1);
  });

  it("PRO tier has Infinity for menus/items/qrCodes", () => {
    expect(TIER_LIMITS.PRO.menus).toBe(Infinity);
    expect(TIER_LIMITS.PRO.menuItems).toBe(Infinity);
    expect(TIER_LIMITS.PRO.qrCodes).toBe(Infinity);
  });
});

describe("TIER_PRICING / getTotalPrice", () => {
  it("FREE price is 0", () => {
    expect(TIER_PRICING.FREE.price).toBe(0);
    expect(getTotalPrice("FREE")).toBe(0);
  });

  it("BASIC total = 34 SAR", () => {
    expect(getTotalPrice("BASIC")).toBeCloseTo(34, 0);
  });

  it.each<[TierKey, number]>([
    ["FREE", 0],
    ["BASIC", 34],
    ["PRO", 109],
    ["ENTERPRISE", 296],
  ])("%s tier total is %d SAR", (tier, expected) => {
    expect(getTotalPrice(tier)).toBeCloseTo(expected, 0);
  });
});
