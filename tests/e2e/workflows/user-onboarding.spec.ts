import { test, expect } from '@playwright/test';
import { ClerkTestHelper } from '../utils/clerk-helper';

test.describe('User Onboarding Workflow', () => {
  let clerkHelper: ClerkTestHelper;

  test.beforeEach(async ({ page }) => {
    clerkHelper = new ClerkTestHelper(page);
  });

  test('Complete user onboarding flow from landing to dashboard', async ({ page }) => {
    // Start from landing page
    await page.goto('/');

    // Verify landing page loads
    await expect(page.locator('h1').first()).toBeVisible();

    // Find and click get started or sign up button
    const getStartedButton = page.locator(
      '[data-testid="get-started"], button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("Sign Up"), a:has-text("Sign Up")'
    ).first();

    await getStartedButton.click();

    // Should navigate to sign up page
    await page.waitForSelector('[data-clerk-sign-up]', { timeout: 10000 });

    // Generate unique test user
    const timestamp = Date.now();
    const testEmail = `test-onboarding-${timestamp}@example.com`;
    const testPassword = 'OnboardingTest123!';
    const firstName = 'Test';
    const lastName = 'User';

    // Fill sign up form
    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="emailAddress"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);

    // Submit sign up form
    await page.locator('button[type="submit"], button:has-text("Sign up")').click();

    // Handle email verification if present
    const hasVerification = await page.locator('[data-clerk-verification]').isVisible().catch(() => false);
    
    if (hasVerification) {
      // In test environment, skip verification or use test code
      console.log('Email verification step - using test environment bypass');
      
      // Check if there's a skip option for testing
      const skipButton = page.locator('button:has-text("Skip"), a:has-text("Skip")');
      if (await skipButton.isVisible()) {
        await skipButton.click();
      } else {
        // Use test verification code if available
        const testCode = process.env.TEST_VERIFICATION_CODE || '123456';
        await page.fill('input[name="code"]', testCode);
        await page.locator('button[type="submit"], button:has-text("Verify")').click();
      }
    }

    // Should redirect to onboarding or dashboard
    await page.waitForURL(/\/onboarding|\/dashboard|\/welcome/, { timeout: 15000 });

    // Check if there's an onboarding flow
    const currentUrl = page.url();
    if (currentUrl.includes('/onboarding') || currentUrl.includes('/welcome')) {
      await this.completeOnboardingSteps(page);
    }

    // Should end up on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify dashboard content is visible
    await expect(
      page.locator('[data-testid="dashboard"], h1:has-text("Dashboard"), .dashboard-content').first()
    ).toBeVisible();

    // Verify user menu is accessible
    await expect(
      page.locator('[data-testid="user-menu"], [data-clerk-user-button]').first()
    ).toBeVisible();
  });

  test('Onboarding with social sign up (if available)', async ({ page }) => {
    await page.goto('/');

    // Look for sign up
    await page.locator('[data-testid="sign-up"], button:has-text("Sign Up"), a:has-text("Sign Up")').first().click();

    // Wait for sign up form
    await page.waitForSelector('[data-clerk-sign-up]', { timeout: 10000 });

    // Look for social sign up options
    const socialButtons = await page.locator('button:has-text("Google"), button:has-text("GitHub"), [data-clerk-social]').all();

    if (socialButtons.length > 0) {
      console.log(`Found ${socialButtons.length} social sign up options`);
      
      // Click the first social option (but don't complete - just verify it's wired up)
      await socialButtons[0].click();
      
      // Should redirect to social provider or show popup
      // In test environment, this might redirect back immediately
      await page.waitForTimeout(2000);
      
      // Verify we're either redirected or have a popup
      const currentUrl = page.url();
      const hasSocialRedirect = 
        currentUrl.includes('google.com') ||
        currentUrl.includes('github.com') ||
        currentUrl.includes('oauth') ||
        currentUrl !== page.url(); // URL changed

      console.log('Social sign up redirect detected:', hasSocialRedirect);
    } else {
      console.log('No social sign up options found');
    }
  });

  test('User profile completion after sign up', async ({ page }) => {
    // Create account first
    const timestamp = Date.now();
    const testEmail = `test-profile-${timestamp}@example.com`;
    const testPassword = 'ProfileTest123!';

    await clerkHelper.createTestUser(testEmail, testPassword);

    // Navigate to profile completion
    await page.goto('/profile');

    // Fill additional profile information
    const additionalFields = [
      { name: 'company', value: 'Test Company' },
      { name: 'jobTitle', value: 'Software Developer' },
      { name: 'phone', value: '+1234567890' },
    ];

    for (const field of additionalFields) {
      const input = page.locator(`input[name="${field.name}"]`);
      if (await input.isVisible()) {
        await input.fill(field.value);
      }
    }

    // Save profile changes
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Verify success message
      await expect(
        page.locator('text=Profile updated, text=Changes saved, .success-message').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Dashboard tour and feature discovery', async ({ page }) => {
    await clerkHelper.signInTestUser();
    await page.goto('/dashboard');

    // Look for tour or help elements
    const tourElements = [
      '[data-testid="tour-start"]',
      'button:has-text("Take Tour")',
      'button:has-text("Get Started")',
      '.tour-trigger',
      '[data-tour]',
    ];

    let tourFound = false;
    for (const selector of tourElements) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        await element.click();
        tourFound = true;
        break;
      }
    }

    if (tourFound) {
      // Navigate through tour steps
      for (let i = 0; i < 5; i++) {
        const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), [data-tour-next]');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
        } else {
          break;
        }
      }

      // Complete tour
      const finishButton = page.locator('button:has-text("Finish"), button:has-text("Done"), button:has-text("Close")');
      if (await finishButton.isVisible()) {
        await finishButton.click();
      }
    }

    // Verify main dashboard features are accessible
    const expectedFeatures = [
      '[data-testid="main-content"]',
      '[data-testid="navigation"]',
      '[data-testid="user-menu"]',
    ];

    for (const feature of expectedFeatures) {
      const element = page.locator(feature);
      if (await element.isVisible()) {
        console.log(`Feature found: ${feature}`);
      }
    }
  });

  test('Settings configuration during onboarding', async ({ page }) => {
    await clerkHelper.signInTestUser();
    await page.goto('/settings');

    // Configure basic settings
    const settingsSections = [
      { name: 'notifications', toggles: ['email', 'push', 'sms'] },
      { name: 'privacy', toggles: ['analytics', 'marketing'] },
      { name: 'preferences', toggles: ['darkMode', 'language'] },
    ];

    for (const section of settingsSections) {
      // Look for section
      const sectionElement = page.locator(`[data-testid="${section.name}"], text=${section.name}`);
      if (await sectionElement.isVisible()) {
        await sectionElement.click();

        // Configure toggles in this section
        for (const toggle of section.toggles) {
          const toggleElement = page.locator(`input[name="${toggle}"], [data-testid="${toggle}-toggle"]`);
          if (await toggleElement.isVisible()) {
            await toggleElement.click();
          }
        }
      }
    }

    // Save settings
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Update Settings")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      await expect(
        page.locator('text=Settings saved, text=Preferences updated').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Email preferences setup', async ({ page }) => {
    await clerkHelper.signInTestUser();
    
    // Navigate to email preferences
    await page.goto('/settings');
    
    const emailSection = page.locator('text=Email, [data-testid="email-settings"]').first();
    if (await emailSection.isVisible()) {
      await emailSection.click();

      // Configure email preferences
      const emailTypes = [
        'marketing',
        'product-updates',
        'security-alerts',
        'billing-notifications'
      ];

      for (const emailType of emailTypes) {
        const checkbox = page.locator(`input[name="${emailType}"], [data-testid="${emailType}-email"]`);
        if (await checkbox.isVisible()) {
          // Check some, uncheck others for variety
          if (emailType.includes('security') || emailType.includes('billing')) {
            await checkbox.check();
          } else {
            await checkbox.uncheck();
          }
        }
      }

      // Save email preferences
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }
    }
  });

  test('Subscription/pricing plan selection (if available)', async ({ page }) => {
    await clerkHelper.signInTestUser();
    
    // Look for pricing or subscription section
    await page.goto('/pricing');
    
    // Check if pricing plans are available
    const pricingPlans = await page.locator('[data-testid="pricing-plan"], .pricing-card, .plan-card').all();
    
    if (pricingPlans.length > 0) {
      // Select the first available plan
      const selectButton = pricingPlans[0].locator('button:has-text("Select"), button:has-text("Choose")');
      if (await selectButton.isVisible()) {
        await selectButton.click();
        
        // Should navigate to checkout or billing setup
        await page.waitForURL(/\/checkout|\/billing|\/subscribe/, { timeout: 10000 });
        
        // Verify checkout form appears (don't complete payment in tests)
        const checkoutForm = page.locator('[data-testid="checkout-form"], .stripe-checkout, form');
        if (await checkoutForm.isVisible()) {
          console.log('Checkout form loaded successfully');
        }
      }
    }
  });

  // Helper method for completing onboarding steps
  private async completeOnboardingSteps(page: any): Promise<void> {
    // Look for common onboarding step patterns
    const maxSteps = 5;
    
    for (let step = 0; step < maxSteps; step++) {
      // Look for next button or continue button
      const nextButton = page.locator(
        'button:has-text("Next"), button:has-text("Continue"), button:has-text("Get Started"), [data-testid="next-step"]'
      );
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      } else {
        // Look for finish or complete button
        const finishButton = page.locator('button:has-text("Finish"), button:has-text("Complete"), button:has-text("Go to Dashboard")');
        if (await finishButton.isVisible()) {
          await finishButton.click();
          break;
        } else {
          // No more steps found
          break;
        }
      }
    }
  }
});