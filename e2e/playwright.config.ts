import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Builds the real production bundle and serves it with `vite preview`, same
  // as the Docker image does. VITE_API_BASE_URL='' makes API calls same-origin
  // relative paths (see api/client.ts) so fixtures/api.ts can intercept them
  // with page.route without hitting a real backend, Postgres, or Redis.
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    cwd: '../resale-datasg-frontend',
    url: BASE_URL,
    env: { VITE_API_BASE_URL: '' },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
