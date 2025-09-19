/**
 * Test data fixtures for E2E testing
 * Provides consistent test data across all test suites
 */

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
}

export interface TestData {
  users: {
    valid: TestUser;
    admin: TestUser;
    newSignup: TestUser;
  };
  forms: {
    validProfile: {
      firstName: string;
      lastName: string;
      company: string;
      jobTitle: string;
      phone: string;
    };
    validSettings: {
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
      privacy: {
        analytics: boolean;
        marketing: boolean;
      };
    };
  };
  security: {
    xssPayloads: string[];
    sqlInjectionPayloads: string[];
    sensitivePatterns: RegExp[];
  };
}

export const testData: TestData = {
  users: {
    valid: {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      company: 'Test Company',
      jobTitle: 'Software Developer',
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      company: 'Test Company',
      jobTitle: 'Administrator',
    },
    newSignup: {
      email: `test-${Date.now()}@example.com`,
      password: 'NewUserPassword123!',
      firstName: 'New',
      lastName: 'User',
      company: 'New Company',
      jobTitle: 'New Developer',
    },
  },
  forms: {
    validProfile: {
      firstName: 'Updated',
      lastName: 'User',
      company: 'Updated Company',
      jobTitle: 'Senior Developer',
      phone: '+1234567890',
    },
    validSettings: {
      notifications: {
        email: true,
        push: false,
        sms: true,
      },
      privacy: {
        analytics: false,
        marketing: false,
      },
    },
  },
  security: {
    xssPayloads: [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("xss")',
      '<svg onload="alert(1)">',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<object data="javascript:alert(1)">',
      '<embed src="javascript:alert(1)">',
    ],
    sqlInjectionPayloads: [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; DELETE FROM users; --",
      "' OR 1=1 --",
      "admin'--",
      "' OR 'x'='x",
    ],
    sensitivePatterns: [
      /sk_[a-zA-Z0-9]+/g,           // Stripe secret keys
      /pk_[a-zA-Z0-9]+/g,           // Publishable keys (context dependent)
      /[a-zA-Z0-9]{40,}/g,          // Long tokens
      /password\s*[:=]\s*["'][^"']+["']/gi,  // Password assignments
      /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi,  // API key assignments
      /secret\s*[:=]\s*["'][^"']+["']/gi,     // Secret assignments
      /bearer\s+[a-zA-Z0-9]+/gi,   // Bearer tokens
    ],
  },
};

/**
 * Generate unique test user data
 */
export function generateTestUser(prefix = 'test'): TestUser {
  const timestamp = Date.now();
  return {
    email: `${prefix}-${timestamp}@example.com`,
    password: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)}Password123!`,
    firstName: prefix.charAt(0).toUpperCase() + prefix.slice(1),
    lastName: 'User',
    company: `${prefix} Company`,
    jobTitle: `${prefix} Developer`,
  };
}

/**
 * Get test credentials from environment or defaults
 */
export function getTestCredentials(): { email: string; password: string } {
  return {
    email: process.env.TEST_USER_EMAIL || testData.users.valid.email,
    password: process.env.TEST_USER_PASSWORD || testData.users.valid.password,
  };
}

/**
 * URLs used in testing
 */
export const testUrls = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  dashboard: '/dashboard',
  profile: '/profile',
  settings: '/settings',
  pricing: '/pricing',
  health: '/api/health',
  signOut: '/sign-out',
};

/**
 * Common selectors used across tests
 */
export const selectors = {
  // Authentication
  signInButton: '[data-testid="sign-in"], button:has-text("Sign In"), a:has-text("Sign In"), a:has-text("Login")',
  signUpButton: '[data-testid="sign-up"], button:has-text("Sign Up"), a:has-text("Sign Up")',
  signOutButton: 'button:has-text("Sign out"), button:has-text("Logout"), a:has-text("Sign out")',
  
  // Forms
  emailInput: 'input[name="identifier"], input[name="emailAddress"], input[type="email"]',
  passwordInput: 'input[name="password"], input[type="password"]',
  firstNameInput: 'input[name="firstName"]',
  lastNameInput: 'input[name="lastName"]',
  submitButton: 'button[type="submit"]',
  
  // Clerk specific
  clerkSignIn: '[data-clerk-sign-in]',
  clerkSignUp: '[data-clerk-sign-up]',
  clerkUserButton: '[data-clerk-user-button]',
  clerkVerification: '[data-clerk-verification]',
  clerk2FA: '[data-clerk-2fa]',
  clerkUserProfile: '[data-clerk-user-profile]',
  
  // Navigation
  userMenu: '[data-testid="user-menu"], [data-clerk-user-button], [aria-label="User menu"]',
  navigation: '[data-testid="navigation"], nav',
  dashboard: '[data-testid="dashboard"], h1:has-text("Dashboard"), .dashboard-content',
  
  // Common UI elements
  loadingSpinner: '[data-testid="loading"], .loading, .spinner',
  errorMessage: '[data-testid="error"], .error, .alert-error',
  successMessage: '[data-testid="success"], .success, .alert-success',
  
  // Form elements
  saveButton: 'button:has-text("Save"), button:has-text("Update")',
  cancelButton: 'button:has-text("Cancel")',
  nextButton: 'button:has-text("Next"), button:has-text("Continue")',
  finishButton: 'button:has-text("Finish"), button:has-text("Done"), button:has-text("Complete")',
};

/**
 * Common timeouts used in tests
 */
export const timeouts = {
  short: 5000,
  medium: 10000,
  long: 15000,
  veryLong: 30000,
  navigation: 10000,
  formSubmission: 15000,
  authentication: 20000,
};

/**
 * Test configuration options
 */
export const testConfig = {
  // Whether to skip tests that require real external services
  skipExternalServices: process.env.SKIP_EXTERNAL_TESTS === 'true',
  
  // Whether to run tests in headless mode
  headless: process.env.HEADED !== 'true',
  
  // Test environment
  environment: process.env.NODE_ENV || 'test',
  
  // Base URL for tests
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  
  // Whether to clean up test data after tests
  cleanupAfterTests: process.env.CLEANUP_TEST_DATA !== 'false',
};