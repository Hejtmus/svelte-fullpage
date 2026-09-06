import { expect, test } from '@playwright/test'
import { HEADER_HEIGHT, documentSnapType, open, scrollSettled, scrollY, topOf } from './helpers'

test.describe('the page itself scrolls', () => {
    test.beforeEach(async ({ page }) => {
        await open(page)
    })

    test('the document carries the scroll, with the snapping on it', async ({ page }) => {
        await page.mouse.wheel(0, 1200)
        await scrollSettled(page)

        expect(await scrollY(page)).toBeGreaterThan(0)
        expect(await documentSnapType(page)).toBe('y mandatory')
    })

    test('the header stays put and the footer is reachable', async ({ page }) => {
        await page.keyboard.press('End')
        await scrollSettled(page)

        await expect(page.locator('header')).toBeInViewport()
        await expect(page.locator('footer')).toBeInViewport()
    })

    test('sections come to rest below the fixed header', async ({ page }) => {
        await page.getByRole('button', { name: 'Go to slides' }).click()
        await scrollSettled(page)

        expect(await topOf(page, 'slides')).toBe(HEADER_HEIGHT)
    })

    test('keyboard scrolling is the browser own', async ({ page }) => {
        await page.locator('body').press('PageDown')
        await scrollSettled(page)

        expect(await scrollY(page)).toBeGreaterThan(0)
    })
})

test.describe('deep links', () => {
    test('an incoming hash scrolls to its section', async ({ page }) => {
        await open(page, '/#deep-links')
        await scrollSettled(page)

        expect(await topOf(page, 'deep-links')).toBe(HEADER_HEIGHT)
    })

    test('the hash follows the reader, without touching the entry it arrived on', async ({ page }) => {
        await open(page)
        expect(new URL(page.url()).hash).toBe('')

        await page.getByRole('button', { name: 'Go to slides' }).click()
        await scrollSettled(page)
        await expect(page).toHaveURL(/#slides$/)

        await page.goBack()
        expect(new URL(page.url()).hash).toBe('')
    })
})
