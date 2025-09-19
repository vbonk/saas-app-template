import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');

  // Validate environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn(`⚠️ Warning: Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Some tests may fail without proper configuration');
  }

  // Set up test user credentials if not provided
  if (!process.env.TEST_USER_EMAIL) {
    process.env.TEST_USER_EMAIL = 'test@example.com';
    console.log('📧 Using default test user email');
  }

  if (!process.env.TEST_USER_PASSWORD) {
    process.env.TEST_USER_PASSWORD = 'TestPassword123!';
    console.log('🔐 Using default test user password');
  }

  // Create browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Check if application is running
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
    console.log(`🌐 Checking application availability at ${baseURL}`);
    
    const response = await page.goto(baseURL, { timeout: 30000 });
    
    if (!response || response.status() !== 200) {
      throw new Error(`Application not accessible at ${baseURL}`);
    }

    console.log('✅ Application is running and accessible');

    // Check health endpoint if available
    try {
      const healthResponse = await page.goto(`${baseURL}/api/health`);
      if (healthResponse && healthResponse.status() === 200) {
        console.log('✅ Health check endpoint is working');
      }
    } catch (error) {
      console.log('ℹ️ Health check endpoint not available (this is okay)');
    }

    // Verify Clerk is properly configured
    try {
      await page.goto(`${baseURL}/sign-in`);
      
      // Wait for Clerk to load
      await page.waitForFunction(() => {
        return (window as any).Clerk !== undefined;
      }, { timeout: 10000 });

      console.log('✅ Clerk authentication is properly configured');
    } catch (error) {
      console.warn('⚠️ Clerk may not be properly configured for testing');
    }

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;