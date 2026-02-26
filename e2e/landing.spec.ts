import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads with heading and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // Navigation should be present
    const nav = page.locator("nav, header");
    await expect(nav.first()).toBeVisible();
  });

  test("pricing page shows tier cards", async ({ page }) => {
    await page.goto("/pricing");
    // Should show plan names
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/pro/i).first()).toBeVisible();
  });
});
