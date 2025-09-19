import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test teardown...');

  try {
    // Clean up any global test state
    console.log('🗑️ Cleaning up test artifacts...');

    // Clear any temporary files or test data
    // Note: In a real application, you might clean up test database records here

    // Log test completion summary
    console.log('📊 Test session completed');
    console.log(`🌐 Base URL: ${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}`);
    console.log(`📧 Test user: ${process.env.TEST_USER_EMAIL || 'test@example.com'}`);

    console.log('✅ Global teardown completed successfully');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown as it would mask test failures
  }
}

export default globalTeardown;