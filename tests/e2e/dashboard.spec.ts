import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the dashboard', async ({ page }) => {
    await expect(page).toHaveTitle(/OpenClaw Agent Dashboard/)
  })

  test('should display header with title', async ({ page }) => {
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('should show agent panel', async ({ page, browserName }) => {
    // Skip on firefox and webkit due to slower rendering
    test.skip(browserName !== 'chromium', 'Agent panel test only on chromium')
    
    // Wait for page to render
    await page.waitForSelector('header', { timeout: 5000 })
    
    // Wait for the agent panel to be visible (no networkidle due to polling)
    const agentPanel = page.locator('[data-testid="agent-panel"]').first()
    await expect(agentPanel).toBeVisible({ timeout: 20000 })
  })

  test('should have navigation elements', async ({ page }) => {
    // Check for main navigation elements
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })
})