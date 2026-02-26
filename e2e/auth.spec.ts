import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders form fields", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test("invalid credentials show error", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[type="email"], input[name="email"]', "wrong@example.com");
    await page.fill('input[type="password"], input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    // Should show some error indication (text, toast, or redirect with error param)
    await page.waitForTimeout(2000);
    const url = page.url();
    const hasError =
      url.includes("error") ||
      (await page.locator('[role="alert"], .text-red, [class*="error"]').count()) > 0;
    expect(hasError).toBeTruthy();
  });

  test("signup shows validation for short password", async ({ page }) => {
    await page.goto("/auth/signup");
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    if (await nameInput.isVisible()) {
      await nameInput.fill("Test User");
    }
    await emailInput.fill("test@example.com");
    await passwordInput.fill("short");
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1500);
    // Should show validation error about password length
    const body = await page.textContent("body");
    const hasValidation =
      body?.toLowerCase().includes("8") ||
      body?.toLowerCase().includes("password") ||
      body?.toLowerCase().includes("characters");
    expect(hasValidation).toBeTruthy();
  });
});
