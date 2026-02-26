import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  const publicPages = ["/", "/pricing", "/auth/login", "/auth/signup"];

  for (const path of publicPages) {
    test(`${path} returns 200`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    });
  }

  test("dashboard redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/auth|login|signin/i, { timeout: 10000 });
    expect(page.url()).toMatch(/auth|login|signin/i);
  });
});
