import { expect, test } from '@playwright/test'
import { HEADER_HEIGHT, open, scrollSettled, scrollY, topOf } from './helpers'

const sectionDots = (page: import('@playwright/test').Page) =>
    page.getByRole('navigation', { name: 'Sections' }).getByRole('button')

test.describe('indicators', () => {
    test.beforeEach(async ({ page }) => {
        await open(page)
    })

    test('name every section and mark the one being read', async ({ page }) => {
        await expect(sectionDots(page)).toHaveText(['Svelte fullpage', 'Slides', 'Document scroll', 'No hijacking', 'Deep links'])
        await expect(sectionDots(page).first()).toHaveAttribute('aria-current', 'true')

        await sectionDots(page).nth(3).click()
        await scrollSettled(page)

        await expect(sectionDots(page).nth(3)).toHaveAttribute('aria-current', 'true')
        await expect(sectionDots(page).first()).not.toHaveAttribute('aria-current', 'true')
        expect(await topOf(page, 'no-hijacking')).toBe(HEADER_HEIGHT)
    })

    test('follow a section that is filtered out at runtime, and its return', async ({ page }) => {
        await page.getByRole('button', { name: 'Hide “Document scroll”' }).click()

        await expect(sectionDots(page)).toHaveText(['Svelte fullpage', 'Slides', 'No hijacking', 'Deep links'])
        await expect(sectionDots(page).nth(2)).toHaveAttribute('data-index', '2')

        await page.getByRole('button', { name: 'Show “Document scroll”' }).click()

        // Back where it belongs in the document, not appended to the end
        await expect(sectionDots(page)).toHaveText(['Svelte fullpage', 'Slides', 'Document scroll', 'No hijacking', 'Deep links'])
    })

    test('are reachable and operable from the keyboard', async ({ page }) => {
        await sectionDots(page).nth(2).focus()
        await expect(sectionDots(page).nth(2)).toBeFocused()

        await page.keyboard.press('Enter')
        await scrollSettled(page)

        expect(await topOf(page, 'document-scroll')).toBe(HEADER_HEIGHT)
    })
})

test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' })

    test('navigation jumps, with no animation to interrupt', async ({ page }) => {
        await open(page)

        await sectionDots(page).nth(4).click()
        // One frame is all a jump needs
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)))

        expect(await scrollY(page)).toBe(await page.evaluate(() =>
            Math.round(document.getElementById('deep-links')!.offsetTop - 64)))
    })
})
