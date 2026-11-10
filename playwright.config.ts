import { defineConfig, devices } from '@playwright/test';

// the shared dev server; set PW_PORT (and NEXT_DIST_DIR) to run a second one beside it
const port = Number(process.env.PW_PORT) || 3100;

// the chat tests talk to a stubbed proxy on this address
process.env.NEXT_PUBLIC_CHAT_PROXY_URL = 'http://localhost:9999/chat';
// App Check (reCAPTCHA) must not call Google from a test: a key in `.env.local` would turn it on
process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = '';

export default defineConfig({
  testDir: 'tests/automation',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    // set PW_CHANNEL=chrome to use an installed Chrome instead of the downloaded Chromium
    channel: process.env.PW_CHANNEL || undefined,
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PW_CHANNEL || undefined,
      },
    },
  ],
  webServer: {
    command: `npx next dev -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
