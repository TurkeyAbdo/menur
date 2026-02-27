import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  const publicPages = ["/", "/pricing", "/auth/login", "/auth/signup"];

  for (const path of publicPages) {
    test(`${path} returns 200`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    });
  }

  test("dashboard page loads without crashing", async ({ page }) => {
    const response = await page.goto("/dashboard");
    // Dashboard should either load (200) or redirect to auth
    const status = response?.status() ?? 0;
    expect(status).toBeLessThan(500);
  });
});
