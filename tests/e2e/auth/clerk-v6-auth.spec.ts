import { test, expect } from '@playwright/test';
import { ClerkTestHelper } from '../utils/clerk-helper';

test.describe('Clerk v6 Authentication', () => {
  let clerkHelper: ClerkTestHelper;

  test.beforeEach(async ({ page }) => {
    clerkHelper = new ClerkTestHelper(page);
  });

  test('Sign up flow with email verification', async ({ page }) => {
    await page.goto('/');

    // Click sign up button
    await page.locator('[data-testid="sign-up"], button:has-text("Sign Up"), a:has-text("Sign Up")').first().click();

    // Wait for Clerk sign up form
    await page.waitForSelector('[data-clerk-sign-up]', { timeout: 10000 });

    // Generate test email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    // Fill sign up form
    await page.fill('input[name="emailAddress"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);

    // Submit form
    await page.locator('button[type="submit"], button:has-text("Sign up")').click();

    // Check for verification step
    const hasVerification = await page.locator('[data-clerk-verification]').isVisible().catch(() => false);
    
    if (hasVerification) {
      // In test environment, we might skip actual email verification
      console.log('Email verification step detected');
      
      // For testing purposes, we'll check that the verification UI appears
      await expect(page.locator('text=Verify your email')).toBeVisible();
    } else {
      // Check if we're redirected to dashboard (auto-verification in test)
      await page.waitForURL(/\/dashboard|\/app|\/home/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/dashboard|\/app|\/home/);
    }
  });

  test('Sign in flow with existing credentials', async ({ page }) => {
    await page.goto('/');

    // Click sign in button
    await page.locator('[data-testid="sign-in"], button:has-text("Sign In"), a:has-text("Sign In"), a:has-text("Login")').first().click();

    // Wait for Clerk sign in form
    await page.waitForSelector('[data-clerk-sign-in]', { timeout: 10000 });

    // Use test credentials (these should be set up in test environment)
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    // Fill sign in form
    await page.fill('input[name="identifier"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);

    // Submit form
    await page.locator('button[type="submit"], button:has-text("Sign in")').click();

    // Handle potential 2FA or verification steps
    const has2FA = await page.locator('[data-clerk-2fa]').isVisible().catch(() => false);
    
    if (has2FA) {
      console.log('2FA step detected - skipping for test');
      // In a real test, you'd handle 2FA here
    } else {
      // Check for successful sign in
      await page.waitForURL(/\/dashboard|\/app|\/home/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/dashboard|\/app|\/home/);
    }
  });

  test('User profile update flow', async ({ page }) => {
    // Assumes user is already signed in
    await clerkHelper.signInTestUser();

    // Navigate to profile/settings
    await page.goto('/profile');
    
    // Wait for profile form
    await page.waitForSelector('[data-clerk-user-profile]', { timeout: 10000 });

    // Update first name
    const newFirstName = `Test-${Date.now()}`;
    await page.fill('input[name="firstName"]', newFirstName);

    // Save changes
    await page.locator('button:has-text("Save"), button:has-text("Update")').click();

    // Verify success message or updated display
    await expect(
      page.locator('text=Profile updated, text=Changes saved').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Password change flow', async ({ page }) => {
    await clerkHelper.signInTestUser();

    // Navigate to security settings
    await page.goto('/profile');
    
    // Look for password/security section
    await page.locator('text=Password, text=Security, [data-testid="password-section"]').first().click();

    // Fill current password
    await page.fill('input[name="currentPassword"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    
    // Fill new password
    const newPassword = `NewPassword${Date.now()}!`;
    await page.fill('input[name="password"], input[name="newPassword"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);

    // Submit password change
    await page.locator('button:has-text("Change password"), button:has-text("Update password")').click();

    // Verify success
    await expect(
      page.locator('text=Password updated, text=Password changed')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Sign out flow', async ({ page }) => {
    await clerkHelper.signInTestUser();

    // Look for user menu or sign out button
    const userMenuSelectors = [
      '[data-testid="user-menu"]',
      '[data-clerk-user-button]',
      'button:has-text("Profile")',
      '[aria-label="User menu"]',
      '.user-avatar',
    ];

    let userMenu = null;
    for (const selector of userMenuSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          userMenu = element;
          break;
        }
      } catch {
        continue;
      }
    }

    if (userMenu) {
      await userMenu.click();
      
      // Click sign out
      await page.locator('button:has-text("Sign out"), button:has-text("Logout"), a:has-text("Sign out")').click();
    } else {
      // Direct navigation to sign out if no user menu found
      await page.goto('/sign-out');
    }

    // Verify redirect to landing page
    await page.waitForURL(/\/$|\/sign-in|\/login/, { timeout: 10000 });
    
    // Verify we're actually signed out by checking for sign in button
    await expect(
      page.locator('button:has-text("Sign In"), a:has-text("Sign In"), a:has-text("Login")')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Protected route access without auth', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto('/dashboard');

    // Should redirect to sign in
    await page.waitForURL(/\/sign-in|\/login|\/auth/, { timeout: 10000 });
    
    // Verify sign in form is present
    await expect(page.locator('[data-clerk-sign-in]')).toBeVisible();
  });

  test('Session persistence after page reload', async ({ page }) => {
    await clerkHelper.signInTestUser();

    // Navigate to protected page
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Reload page
    await page.reload();

    // Should still be on protected page (session persisted)
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify authenticated content is still visible
    await expect(
      page.locator('[data-testid="dashboard"], h1:has-text("Dashboard"), text=Welcome')
    ).toBeVisible();
  });

  test('Multiple tab session sync', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Sign in on first tab
    const helper1 = new ClerkTestHelper(page1);
    await helper1.signInTestUser();

    // Navigate to protected page on second tab
    await page2.goto('/dashboard');

    // Should be automatically signed in due to session sync
    await expect(page2).toHaveURL(/\/dashboard/);
    
    // Sign out on first tab
    await page1.goto('/sign-out');

    // Second tab should also be signed out (or redirect on next navigation)
    await page2.reload();
    await page2.waitForURL(/\/sign-in|\/login|\/auth|\/$/, { timeout: 10000 });

    await context.close();
  });
});