require('dotenv').config();

const requiredVariables = [
  'BEECEPTOR_CONSOLE_URL',
  'BEECEPTOR_API_URL',
  'WEBHOOK_TARGET_URL',
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`
    );
  }
}

const config = {
  beeceptorConsoleUrl: process.env.BEECEPTOR_CONSOLE_URL,
  beeceptorApiUrl: process.env.BEECEPTOR_API_URL,
  webhookTargetUrl: process.env.WEBHOOK_TARGET_URL,

  demoMode: process.env.DEMO_MODE === 'true',
  demoSlowMo: Number(process.env.DEMO_SLOW_MO || 0),
  demoPauseMs: Number(process.env.DEMO_PAUSE_MS || 0),
};

module.exports = { config };