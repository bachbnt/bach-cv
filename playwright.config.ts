import { defineConfig, devices } from '@playwright/test';

const port = 3100;

// the chat tests talk to a stubbed proxy on this address
process.env.NEXT_PUBLIC_CHAT_PROXY_URL = 'http://localhost:9999/chat';

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
