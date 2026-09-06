import { defineConfig, devices } from '@playwright/test'

const PORT = 5178

// One browser: these tests are about the platform's own scrolling, snapping and pointer
// behaviour, which jsdom has none of — not about cross browser rendering
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [['html'], ['list']] : 'list',
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'on-first-retry'
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
    ],
    webServer: {
        command: `npm run dev -- --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        stdout: 'ignore'
    }
})
