import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for User Registration API Testing.
 *
 * Configured for API testing only (no browser needed).
 * HTML reporter outputs to playwright-report/.
 * Optional Allure reporter outputs to allure-results/.
 * WebServer config auto-starts the API before tests.
 */
export default defineConfig({
  // Test file patterns
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  // Timeout settings
  timeout: 30_000, // 30 seconds per test
  expect: {
    timeout: 5_000, // 5 seconds for assertions
  },

  // Retry configuration: 1 retry on CI, 0 locally
  retries: process.env.CI ? 1 : 0,

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only is left in source
  forbidOnly: !!process.env.CI,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
    // Optional Allure reporter - enable by setting ALLURE=true env variable
    ...(process.env.ALLURE
      ? [['allure-playwright', { outputFolder: 'allure-results' }] as [string, object]]
      : []),
  ],

  // API testing project (no browser)
  projects: [
    {
      name: 'api-tests',
      use: {
        baseURL: 'http://localhost:3000',
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
  ],

  // Auto-start the API server before running tests
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000, // 30 seconds to start
  },
});
