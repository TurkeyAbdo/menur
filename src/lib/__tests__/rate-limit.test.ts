import { describe, it, expect } from "vitest";
import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  it("allows requests within the limit", () => {
    const key = "test-allow-" + Date.now();
    const result = rateLimit(key, 3, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests over the limit", () => {
    const key = "test-block-" + Date.now();
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const result = rateLimit(key, 2, 60_000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the window expires", async () => {
    const key = "test-reset-" + Date.now();
    // Use a 10ms window
    rateLimit(key, 1, 10);
    // Wait for expiry
    await new Promise((r) => setTimeout(r, 15));
    const result = rateLimit(key, 1, 10);
    expect(result.success).toBe(true);
  });

  it("tracks different keys independently", () => {
    const ts = Date.now();
    const key1 = "test-key1-" + ts;
    const key2 = "test-key2-" + ts;
    rateLimit(key1, 1, 60_000);
    rateLimit(key1, 1, 60_000); // over limit
    const result = rateLimit(key2, 1, 60_000); // different key, should pass
    expect(result.success).toBe(true);
  });
});
