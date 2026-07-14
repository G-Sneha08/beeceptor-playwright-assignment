const {
  defineConfig,
  devices,
} = require('@playwright/test');

require('dotenv').config();

const demoMode =
  process.env.DEMO_MODE === 'true';

const slowMo = Number(
  process.env.DEMO_SLOW_MO || 0
);

module.exports = defineConfig({
  testDir: './tests',

  timeout: 180000,

  expect: {
    timeout: 20000,
  },

  fullyParallel: false,

  workers: 1,

  retries: 0,

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder:
          'playwright-report',
        open: 'never',
      },
    ],
  ],

  use: {
    headless: !demoMode,

    actionTimeout: 15000,

    navigationTimeout: 30000,

    screenshot:
      'only-on-failure',

    video:
      'retain-on-failure',

    trace:
      'retain-on-failure',

    launchOptions: {
      slowMo:
        demoMode ? slowMo : 0,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices[
          'Desktop Chrome'
        ],
      },
    },
  ],
});