import { Page, expect } from '@playwright/test';

export class ClerkTestHelper {
  constructor(private page: Page) {}

  /**
   * Sign in with test user credentials
   */
  async signInTestUser(): Promise<void> {
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    await this.signIn(testEmail, testPassword);
  }

  /**
   * Sign in with custom credentials
   */
  async signIn(email: string, password: string): Promise<void> {
    await this.page.goto('/');

    // Look for sign in button
    const signInButton = this.page.locator(
      '[data-testid="sign-in"], button:has-text("Sign In"), a:has-text("Sign In"), a:has-text("Login")'
    ).first();

    if (await signInButton.isVisible()) {
      await signInButton.click();
    } else {
      // Try direct navigation to sign in page
      await this.page.goto('/sign-in');
    }

    // Wait for Clerk sign in form
    await this.page.waitForSelector('[data-clerk-sign-in]', { timeout: 10000 });

    // Fill credentials
    await this.page.fill('input[name="identifier"], input[type="email"]', email);
    await this.page.fill('input[name="password"], input[type="password"]', password);

    // Submit form
    await this.page.locator('button[type="submit"], button:has-text("Sign in")').click();

    // Wait for successful sign in (redirect to dashboard or protected page)
    await this.page.waitForURL(/\/dashboard|\/app|\/home/, { timeout: 15000 });
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    // Look for user menu or direct sign out
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
        const element = this.page.locator(selector);
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
      await this.page.locator('button:has-text("Sign out"), button:has-text("Logout")').click();
    } else {
      await this.page.goto('/sign-out');
    }

    // Wait for redirect to public page
    await this.page.waitForURL(/\/$|\/sign-in|\/login/, { timeout: 10000 });
  }

  /**
   * Check if user is currently signed in
   */
  async isSignedIn(): Promise<boolean> {
    try {
      // Try to access a protected route
      await this.page.goto('/dashboard');
      
      // If we're on dashboard without redirect, user is signed in
      await this.page.waitForTimeout(2000);
      const currentUrl = this.page.url();
      return currentUrl.includes('/dashboard');
    } catch {
      return false;
    }
  }

  /**
   * Get current user information from Clerk
   */
  async getCurrentUser(): Promise<any> {
    return await this.page.evaluate(() => {
      // Access Clerk's global object if available
      return (window as any).Clerk?.user || null;
    });
  }

  /**
   * Create a test user account
   */
  async createTestUser(email: string, password: string, firstName = 'Test', lastName = 'User'): Promise<void> {
    await this.page.goto('/');

    // Click sign up
    await this.page.locator('[data-testid="sign-up"], button:has-text("Sign Up"), a:has-text("Sign Up")').first().click();

    // Wait for sign up form
    await this.page.waitForSelector('[data-clerk-sign-up]', { timeout: 10000 });

    // Fill form
    await this.page.fill('input[name="firstName"]', firstName);
    await this.page.fill('input[name="lastName"]', lastName);
    await this.page.fill('input[name="emailAddress"], input[type="email"]', email);
    await this.page.fill('input[name="password"], input[type="password"]', password);

    // Submit
    await this.page.locator('button[type="submit"], button:has-text("Sign up")').click();

    // Handle verification if required
    const hasVerification = await this.page.locator('[data-clerk-verification]').isVisible().catch(() => false);
    
    if (hasVerification) {
      console.log('Email verification required for test user creation');
      // In test environment, you might want to skip or mock this
    }
  }

  /**
   * Wait for Clerk to be fully loaded
   */
  async waitForClerkToLoad(): Promise<void> {
    await this.page.waitForFunction(() => {
      return (window as any).Clerk && (window as any).Clerk.loaded;
    }, { timeout: 10000 });
  }

  /**
   * Simulate session expiry and renewal
   */
  async simulateSessionExpiry(): Promise<void> {
    // Clear session cookies
    await this.page.context().clearCookies();
    
    // Reload page to trigger session check
    await this.page.reload();
    
    // Should redirect to sign in
    await this.page.waitForURL(/\/sign-in|\/login|\/auth/, { timeout: 10000 });
  }

  /**
   * Test multi-factor authentication flow
   */
  async handleTwoFactorAuth(code: string): Promise<void> {
    // Wait for 2FA form
    await this.page.waitForSelector('[data-clerk-2fa]', { timeout: 10000 });
    
    // Enter verification code
    await this.page.fill('input[name="code"], input[name="totp"]', code);
    
    // Submit
    await this.page.locator('button[type="submit"], button:has-text("Verify")').click();
    
    // Wait for successful verification
    await this.page.waitForURL(/\/dashboard|\/app|\/home/, { timeout: 10000 });
  }

  /**
   * Check for specific Clerk errors
   */
  async checkForClerkErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    // Look for common Clerk error patterns
    const errorSelectors = [
      '[data-clerk-error]',
      '.cl-formFieldErrorText',
      '.clerk-error',
      'text=Invalid credentials',
      'text=User not found',
      'text=Something went wrong',
    ];

    for (const selector of errorSelectors) {
      try {
        const errorElements = await this.page.locator(selector).all();
        for (const element of errorElements) {
          if (await element.isVisible()) {
            const errorText = await element.textContent();
            if (errorText) {
              errors.push(errorText.trim());
            }
          }
        }
      } catch {
        // Continue checking other selectors
      }
    }

    return errors;
  }
}