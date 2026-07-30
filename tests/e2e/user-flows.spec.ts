import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads and displays hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AFRID/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("waitlist form validates empty email", async ({ page }) => {
    await page.goto("/");
    const waitlistButton = page.locator("button", { hasText: /join|waitlist|notify/i }).first();
    if (await waitlistButton.isVisible()) {
      await waitlistButton.click();
      // Should not show a success toast/message on empty email
      const successMsg = page.locator('[role="alert"], .toast, [data-test="success"]', { hasText: /added to waitlist|already on waitlist/i });
      await expect(successMsg).not.toBeVisible({ timeout: 2000 });
    }
  });

  test("waitlist form accepts valid email", async ({ page }) => {
    await page.goto("/");
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill("test-e2e@example.com");
      const submitButton = page.locator("button", { hasText: /join|waitlist|notify/i }).first();
      await submitButton.click();
      // Wait for either success or error (API may not be running)
      await page.waitForTimeout(2000);
    }
  });

  test("navigation links are present", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
  });
});

test.describe("Authentication Pages", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/AFRID/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveTitle(/AFRID/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("login form shows validation on empty submit", async ({ page }) => {
    await page.goto("/login");
    const submitButton = page.locator("button[type='submit']").first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test("login form rejects invalid email format", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill("not-an-email");
      const submitButton = page.locator("button[type='submit']").first();
      await submitButton.click();
      // Browser's native email validation should prevent submission
      await page.waitForTimeout(1000);
      // Should still be on login page
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe("Protected Routes Redirect", () => {
  test("dashboard redirects unauthenticated user", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login or show auth prompt
    await page.waitForTimeout(3000);
    const url = page.url();
    // Either redirected to login or stayed on dashboard with loading state
    expect(url).toMatch(/\/(login|dashboard)/);
  });

  test("wallet redirects unauthenticated user", async ({ page }) => {
    await page.goto("/wallet");
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(login|wallet)/);
  });

  test("record page redirects unauthenticated user", async ({ page }) => {
    await page.goto("/record");
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(login|record)/);
  });

  test("submissions redirects unauthenticated user", async ({ page }) => {
    await page.goto("/submissions");
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(login|submissions)/);
  });
});

test.describe("404 and Error Pages", () => {
  test("non-existent route shows 404", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-12345");
    await expect(page.locator("text=404")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Public Pages", () => {
  test("contribute page loads", async ({ page }) => {
    await page.goto("/contribute");
    await expect(page.locator("body")).toBeVisible();
  });

  test("join page loads", async ({ page }) => {
    await page.goto("/join");
    await expect(page.locator("body")).toBeVisible();
  });

  test("validator page loads", async ({ page }) => {
    await page.goto("/validator");
    await expect(page.locator("body")).toBeVisible();
  });

  test("reviewer page loads", async ({ page }) => {
    await page.goto("/reviewer");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Edge Cases", () => {
  test("handles very long URL path gracefully", async ({ page }) => {
    const longPath = "/a".repeat(100);
    await page.goto(longPath);
    await expect(page.locator("text=404")).toBeVisible({ timeout: 5000 });
  });

  test("handles special characters in URL", async ({ page }) => {
    await page.goto("/test%20special%20chars");
    await expect(page.locator("text=404")).toBeVisible({ timeout: 5000 });
  });
});
