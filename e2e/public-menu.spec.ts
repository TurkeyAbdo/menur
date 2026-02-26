import { test, expect } from "@playwright/test";

test.describe("Public Menu", () => {
  test("menu slug page displays content or loading state", async ({ page }) => {
    const response = await page.goto("/menu/test-restaurant");
    // Page should either load content or show a not-found / loading state
    expect(response?.status()).toBeLessThan(500);
    // Body should not be empty
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(0);
  });
});
