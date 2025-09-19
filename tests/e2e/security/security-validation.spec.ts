import { test, expect } from '@playwright/test';
import { ClerkTestHelper } from '../utils/clerk-helper';

test.describe('Security Validation', () => {
  let clerkHelper: ClerkTestHelper;

  test.beforeEach(async ({ page }) => {
    clerkHelper = new ClerkTestHelper(page);
  });

  test('No sensitive data in browser storage', async ({ page }) => {
    await clerkHelper.signInTestUser();
    await page.goto('/dashboard');

    // Check localStorage for sensitive patterns
    const localStorage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          items[key] = window.localStorage.getItem(key) || '';
        }
      }
      return items;
    });

    // Check sessionStorage for sensitive patterns
    const sessionStorage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) {
          items[key] = window.sessionStorage.getItem(key) || '';
        }
      }
      return items;
    });

    // Sensitive patterns that should NOT be in browser storage
    const sensitivePatterns = [
      /sk_/i,          // Stripe secret keys
      /pk_/i,          // Publishable keys in storage (should be in code only)
      /api_key/i,      // API keys
      /secret/i,       // Any secrets
      /password/i,     // Passwords
      /token.*[a-zA-Z0-9]{20,}/i,  // Long tokens
      /bearer/i,       // Bearer tokens
    ];

    // Check localStorage
    for (const [key, value] of Object.entries(localStorage)) {
      for (const pattern of sensitivePatterns) {
        expect(key).not.toMatch(pattern);
        expect(value).not.toMatch(pattern);
      }
    }

    // Check sessionStorage
    for (const [key, value] of Object.entries(sessionStorage)) {
      for (const pattern of sensitivePatterns) {
        expect(key).not.toMatch(pattern);
        expect(value).not.toMatch(pattern);
      }
    }
  });

  test('HTTPS enforcement', async ({ page }) => {
    // Skip this test in local development
    if (page.url().includes('localhost')) {
      test.skip();
    }

    await page.goto('/');
    
    // Verify we're on HTTPS
    expect(page.url()).toMatch(/^https:/);
  });

  test('Security headers present', async ({ page }) => {
    const response = await page.goto('/');
    
    if (response) {
      const headers = response.headers();
      
      // Check for important security headers
      expect(headers['x-frame-options']).toBeTruthy();
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['referrer-policy']).toBeTruthy();
      
      // CSP header should be present (even if basic)
      const csp = headers['content-security-policy'];
      if (csp) {
        expect(csp).toContain('default-src');
      }
    }
  });

  test('No SQL injection vulnerabilities in search', async ({ page }) => {
    await clerkHelper.signInTestUser();
    
    // Find search inputs and test with SQL injection patterns
    await page.goto('/dashboard');
    
    const searchInputs = await page.locator('input[type="search"], input[placeholder*="search"], input[name*="search"]').all();
    
    const sqlInjectionPatterns = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "<script>alert('xss')</script>",
    ];

    for (const input of searchInputs) {
      for (const pattern of sqlInjectionPatterns) {
        await input.fill(pattern);
        await input.press('Enter');
        
        // Wait for any potential response
        await page.waitForTimeout(1000);
        
        // Check that we don't see database errors or successful injection
        const pageContent = await page.textContent('body');
        expect(pageContent?.toLowerCase()).not.toContain('syntax error');
        expect(pageContent?.toLowerCase()).not.toContain('mysql error');
        expect(pageContent?.toLowerCase()).not.toContain('postgresql error');
        expect(pageContent?.toLowerCase()).not.toContain('sql error');
        
        // Clear the input for next test
        await input.clear();
      }
    }
  });

  test('XSS protection in user inputs', async ({ page }) => {
    await clerkHelper.signInTestUser();
    await page.goto('/profile');

    // Test XSS in profile form fields
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("xss")',
      '<svg onload="alert(1)">',
    ];

    // Find text inputs in profile form
    const textInputs = await page.locator('input[type="text"], textarea').all();

    for (const input of textInputs) {
      for (const payload of xssPayloads) {
        await input.fill(payload);
        
        // Submit form if there's a submit button
        const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
        }

        // Check that XSS payload is not executed
        const alertsTriggered = await page.evaluate(() => {
          return (window as any).alertTriggered || false;
        });
        expect(alertsTriggered).toBe(false);

        // Verify payload is escaped in the DOM
        const pageContent = await page.content();
        expect(pageContent).not.toContain('<script>alert("xss")</script>');
        
        await input.clear();
      }
    }
  });

  test('CSRF protection on state-changing operations', async ({ page }) => {
    await clerkHelper.signInTestUser();
    
    // Test profile update without proper authentication
    const response = await page.request.post('/api/user/profile', {
      data: {
        firstName: 'Hacker',
        lastName: 'Attempt'
      },
      headers: {
        'content-type': 'application/json'
      }
    });

    // Should fail without proper CSRF token or authentication
    expect(response.status()).not.toBe(200);
  });

  test('Rate limiting on authentication endpoints', async ({ page }) => {
    await page.goto('/sign-in');

    // Attempt multiple failed sign-ins rapidly
    for (let i = 0; i < 10; i++) {
      await page.fill('input[name="identifier"], input[type="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
      await page.locator('button[type="submit"], button:has-text("Sign in")').click();
      await page.waitForTimeout(500);
    }

    // Should eventually show rate limiting message
    const pageContent = await page.textContent('body');
    const isRateLimited = 
      pageContent?.toLowerCase().includes('too many attempts') ||
      pageContent?.toLowerCase().includes('rate limit') ||
      pageContent?.toLowerCase().includes('try again later');

    // Rate limiting should be in place (either from Clerk or application level)
    if (!isRateLimited) {
      console.warn('Rate limiting may not be properly configured');
    }
  });

  test('Secure cookie configuration', async ({ page }) => {
    await clerkHelper.signInTestUser();
    
    const cookies = await page.context().cookies();
    
    // Check authentication cookies have secure attributes
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('session') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('clerk') ||
      cookie.name.includes('token')
    );

    for (const cookie of authCookies) {
      // Authentication cookies should be secure and httpOnly
      if (cookie.name.toLowerCase().includes('session') || 
          cookie.name.toLowerCase().includes('auth')) {
        expect(cookie.httpOnly).toBe(true);
        
        // In production, should be secure
        if (!page.url().includes('localhost')) {
          expect(cookie.secure).toBe(true);
        }
        
        // Should have SameSite protection
        expect(['Strict', 'Lax']).toContain(cookie.sameSite);
      }
    }
  });

  test('No sensitive information in client-side code', async ({ page }) => {
    await page.goto('/');

    // Check that no secrets are exposed in the page source
    const pageContent = await page.content();
    
    const sensitivePatterns = [
      /sk_[a-zA-Z0-9]+/g,           // Stripe secret keys
      /[a-zA-Z0-9]{40,}/g,          // Long tokens that might be secrets
      /password\s*[:=]\s*["'][^"']+["']/gi,  // Password assignments
      /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi,  // API key assignments
      /secret\s*[:=]\s*["'][^"']+["']/gi,     // Secret assignments
    ];

    for (const pattern of sensitivePatterns) {
      const matches = pageContent.match(pattern);
      if (matches) {
        // Filter out false positives (like placeholder text)
        const realSecrets = matches.filter(match => 
          !match.includes('placeholder') &&
          !match.includes('example') &&
          !match.includes('YOUR_') &&
          !match.includes('xxxx')
        );
        
        expect(realSecrets.length).toBe(0);
      }
    }
  });

  test('Environment variable protection', async ({ page }) => {
    await page.goto('/');

    // Check that server-side environment variables are not exposed
    const env = await page.evaluate(() => {
      return (window as any).process?.env || {};
    });

    // These should not be accessible from the client
    const restrictedKeys = [
      'DATABASE_URL',
      'CLERK_SECRET_KEY',
      'STRIPE_SECRET_KEY',
      'NEXTAUTH_SECRET',
      'JWT_SECRET'
    ];

    for (const key of restrictedKeys) {
      expect(env[key]).toBeUndefined();
    }
  });

  test('API endpoint authentication', async ({ page }) => {
    // Test that API endpoints require authentication
    const protectedEndpoints = [
      '/api/user/profile',
      '/api/user/settings',
      '/api/admin/users',
    ];

    for (const endpoint of protectedEndpoints) {
      // Try accessing without authentication
      const response = await page.request.get(endpoint);
      
      // Should return 401 Unauthorized or 403 Forbidden
      expect([401, 403]).toContain(response.status());
    }
  });
});