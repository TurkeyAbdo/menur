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
    // Should show plan prices (language-agnostic)
    await expect(page.getByText("0").first()).toBeVisible();
    await expect(page.getByText("109").first()).toBeVisible();
  });
});
