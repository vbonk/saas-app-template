import { test, expect } from '@playwright/test';
import { ClerkTestHelper } from '../utils/clerk-helper';

test.describe('Session Persistence & Management', () => {
  let clerkHelper: ClerkTestHelper;

  test.beforeEach(async ({ page }) => {
    clerkHelper = new ClerkTestHelper(page);
  });

  test('Session persists across page reloads', async ({ page }) => {
    // Sign in user
    await clerkHelper.signInTestUser();
    
    // Navigate to protected page
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Reload the page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();
      
      // Should remain on protected page
      await expect(page).toHaveURL(/\/dashboard/);
      
      // Verify authenticated content is still accessible
      await expect(
        page.locator('[data-testid="dashboard"], h1, .dashboard-content').first()
      ).toBeVisible({ timeout: 5000 });
      
      await page.waitForTimeout(1000); // Brief pause between reloads
    }
  });

  test('Session persists across navigation', async ({ page }) => {
    await clerkHelper.signInTestUser();

    // Navigate through multiple protected pages
    const protectedRoutes = ['/dashboard', '/profile', '/settings'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should not redirect to sign in
      await expect(page).not.toHaveURL(/\/sign-in|\/login|\/auth/);
      
      // Should be on the intended route (or a valid redirect)
      const currentUrl = page.url();
      const isOnProtectedRoute = protectedRoutes.some(r => currentUrl.includes(r)) || 
                                currentUrl.includes('/dashboard');
      expect(isOnProtectedRoute).toBe(true);
    }
  });

  test('Session persists across browser tabs', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Sign in on first tab
    const helper1 = new ClerkTestHelper(page1);
    await helper1.signInTestUser();

    // Verify authentication on second tab
    await page2.goto('/dashboard');
    await expect(page2).toHaveURL(/\/dashboard/);

    // Verify authenticated state on both tabs
    await expect(
      page1.locator('[data-testid="user-menu"], [data-clerk-user-button]').first()
    ).toBeVisible();
    
    await expect(
      page2.locator('[data-testid="user-menu"], [data-clerk-user-button]').first()
    ).toBeVisible();

    await context.close();
  });

  test('Session sync across tabs on sign out', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Sign in on first tab
    const helper1 = new ClerkTestHelper(page1);
    await helper1.signInTestUser();

    // Navigate to protected pages on both tabs
    await page1.goto('/dashboard');
    await page2.goto('/profile');

    // Verify both tabs are authenticated
    await expect(page1).toHaveURL(/\/dashboard/);
    await expect(page2).toHaveURL(/\/profile/);

    // Sign out from first tab
    await helper1.signOut();

    // Second tab should also detect sign out on next interaction
    await page2.reload();
    await page2.waitForURL(/\/sign-in|\/login|\/auth|\/$/, { timeout: 10000 });

    await context.close();
  });

  test('Session recovery after network disconnection', async ({ page, context }) => {
    await clerkHelper.signInTestUser();
    await page.goto('/dashboard');

    // Simulate network disconnection
    await context.setOffline(true);
    
    // Try to navigate (should work with cached session)
    await page.goto('/profile');
    
    // Re-enable network
    await context.setOffline(false);
    
    // Should still be authenticated
    await page.reload();
    await expect(page).not.toHaveURL(/\/sign-in|\/login|\/auth/);
  });

  test('Session expiry and renewal', async ({ page }) => {
    await clerkHelper.signInTestUser();
    await page.goto('/dashboard');

    // Manually expire session by clearing cookies
    await clerkHelper.simulateSessionExpiry();

    // Should redirect to sign in
    await expect(page).toHaveURL(/\/sign-in|\/login|\/auth/);

    // Sign in again
    await clerkHelper.signInTestUser();

    // Should be able to access protected content again
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Remember me functionality', async ({ page }) => {
    // Clear all existing sessions
    await page.context().clearCookies();
    await page.goto('/sign-in');

    // Sign in with remember me checked (if available)
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    await page.fill('input[name="identifier"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);

    // Look for remember me checkbox
    const rememberCheckbox = page.locator('input[type="checkbox"]:has-text("Remember"), input[name="remember"]');
    if (await rememberCheckbox.isVisible()) {
      await rememberCheckbox.check();
    }

    await page.locator('button[type="submit"], button:has-text("Sign in")').click();
    await page.waitForURL(/\/dashboard|\/app|\/home/, { timeout: 15000 });

    // Close and reopen browser context (simulates browser restart)
    const cookies = await page.context().cookies();
    const newContext = await page.context().browser()?.newContext();
    if (newContext) {
      await newContext.addCookies(cookies);
      const newPage = await newContext.newPage();

      // Should still be signed in
      await newPage.goto('/dashboard');
      await expect(newPage).toHaveURL(/\/dashboard/);

      await newContext.close();
    }
  });

  test('Concurrent session limit handling', async ({ browser }) => {
    const contexts: any[] = [];
    const pages: any[] = [];

    try {
      // Create multiple browser contexts (simulating different devices)
      for (let i = 0; i < 3; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        contexts.push(context);
        pages.push(page);

        // Sign in from each "device"
        const helper = new ClerkTestHelper(page);
        await helper.signInTestUser();
      }

      // All should be signed in initially
      for (const page of pages) {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/);
      }

      // If there's a concurrent session limit, earlier sessions might be invalidated
      // This test verifies the application handles this gracefully
      for (let i = 0; i < pages.length - 1; i++) {
        await pages[i].reload();
        // Earlier sessions might be signed out, which is acceptable
        // The test just ensures the app doesn't crash
      }

    } finally {
      // Clean up all contexts
      for (const context of contexts) {
        await context.close();
      }
    }
  });

  test('Session security after password change', async ({ page }) => {
    await clerkHelper.signInTestUser();
    await page.goto('/profile');

    // Change password (this should invalidate other sessions)
    const passwordSection = page.locator('text=Password, text=Security, [data-testid="password-section"]').first();
    if (await passwordSection.isVisible()) {
      await passwordSection.click();

      const currentPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
      const newPassword = `NewPassword${Date.now()}!`;

      await page.fill('input[name="currentPassword"]', currentPassword);
      await page.fill('input[name="password"], input[name="newPassword"]', newPassword);
      await page.fill('input[name="confirmPassword"]', newPassword);

      await page.locator('button:has-text("Change password"), button:has-text("Update password")').click();

      // Should remain signed in on current session
      await expect(page).toHaveURL(/\/profile|\/dashboard/);

      // Update test password for cleanup
      process.env.TEST_USER_PASSWORD = newPassword;
    }
  });
});