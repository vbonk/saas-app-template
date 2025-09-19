import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced Playwright configuration for comprehensive E2E testing
 * Includes Clerk v6 authentication, security validation, and workflow testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Timeout for each test */
  timeout: 30000,
  
  /* Expect timeout for assertions */
  expect: {
    timeout: 10000,
  },
  
  /* Reporter configuration */
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
    
    /* Ignore HTTPS errors in development */
    ignoreHTTPSErrors: !process.env.CI,
  },

  /* Configure projects for different test scenarios */
  projects: [
    /* Desktop browsers */
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        /* Use incognito context for clean state */
        contextOptions: {
          ignoreHTTPSErrors: true,
        },
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Mobile viewports for responsive testing */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        /* Mobile-specific settings */
        hasTouch: true,
      },
    },
    
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true,
      },
    },

    /* Tablet viewports */
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro'],
        hasTouch: true,
      },
    },

    /* High-DPI displays */
    {
      name: 'High DPI',
      use: { 
        ...devices['Desktop Chrome HiDPI'],
        deviceScaleFactor: 2,
      },
    },

    /* Authentication-specific tests */
    {
      name: 'auth-tests',
      testMatch: '**/auth/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        /* Clean state for auth tests */
        storageState: undefined,
      },
    },

    /* Security-specific tests */
    {
      name: 'security-tests',
      testMatch: '**/security/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        /* Security tests need clean state */
        storageState: undefined,
      },
    },

    /* Workflow tests */
    {
      name: 'workflow-tests',
      testMatch: '**/workflows/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        /* Workflow tests might need authenticated state */
      },
    },
  ],

  /* Global test setup and teardown */
  globalSetup: require.resolve('./tests/e2e/config/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/config/global-teardown.ts'),

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    /* Health check endpoint */
    responseExtractor: async (response) => {
      return response.status() === 200;
    },
  },

  /* Test output directories */
  outputDir: 'test-results/',
  
  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  use: {
    ...((module.exports as any)?.use || {}),
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  } as any,
});