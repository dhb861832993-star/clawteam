import { test, expect } from '@playwright/test'

test.describe('Header Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display application title', async ({ page }) => {
    // Check for application branding
    const title = page.locator('text=AGENT MANAGEMENT')
    await expect(title.first()).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page).toHaveScreenshot('header-mobile.png', { maxDiffPixels: 300 })

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await expect(page).toHaveScreenshot('header-desktop.png', { maxDiffPixels: 500 })
  })
})