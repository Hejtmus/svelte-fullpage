import { expect, test } from '@playwright/test'
import { HEADER_HEIGHT, documentSnapType, drag, open, scrollLeftOfSlides, scrollSettled, scrollY, topOf } from './helpers'

const goToSlides = async (page: import('@playwright/test').Page) => {
    await open(page)
    await page.getByRole('button', { name: 'Go to slides' }).click()
    await scrollSettled(page)
    return scrollY(page)
}

test.describe('dragging with a mouse', () => {
    test('pans the page and settles back on the section it stayed nearest', async ({ page }) => {
        const start = await goToSlides(page)

        // A short, slow drag: a placement, not a throw
        await drag(page, { x: 600, y: 500 }, { x: 600, y: 380 }, 30)
        await scrollSettled(page)

        expect(await scrollY(page)).toBe(start)
        expect(await documentSnapType(page)).toBe('y mandatory')
    })

    test('carries on to the next section when it is thrown', async ({ page }) => {
        const start = await goToSlides(page)

        // The same short distance, let go at speed
        await drag(page, { x: 600, y: 500 }, { x: 600, y: 380 }, 2)
        await scrollSettled(page)

        expect(await scrollY(page)).toBeGreaterThan(start)
        expect(await topOf(page, 'document-scroll')).toBe(HEADER_HEIGHT)
    })

    test('carries back when it is thrown the other way', async ({ page }) => {
        const start = await goToSlides(page)

        await drag(page, { x: 600, y: 380 }, { x: 600, y: 500 }, 2)
        await scrollSettled(page)

        expect(await scrollY(page)).toBeLessThan(start)
        // The first section rests against the top of the document, where there is no room for
        // the scroll padding a fixed header asks for
        expect(await scrollY(page)).toBe(0)
        await expect(page.getByRole('navigation', { name: 'Sections' }).getByRole('button').first())
            .toHaveAttribute('aria-current', 'true')
    })

    test('animates the settle rather than jumping to it', async ({ page }) => {
        await goToSlides(page)
        // Records where the page is on every frame, from before the drag until after it lands
        await page.evaluate(() => {
            const samples: number[] = []
            Object.assign(window, { samples })
            const watch = () => {
                samples.push(Math.round(window.scrollY))
                requestAnimationFrame(watch)
            }
            requestAnimationFrame(watch)
        })

        await page.mouse.move(600, 500)
        await page.mouse.down()
        await page.mouse.move(600, 380, { steps: 5 })
        const dropped = await page.evaluate(() => (window as unknown as { samples: number[] }).samples.length)
        await page.mouse.up()
        await scrollSettled(page)

        const settle = await page.evaluate(
            from => [...new Set((window as unknown as { samples: number[] }).samples.slice(from))],
            dropped
        )

        // A jump would show two positions: where it was let go, and where it landed
        expect(settle.length).toBeGreaterThan(3)
    })

    test('leaves the snapping switched back on afterwards', async ({ page }) => {
        await goToSlides(page)

        await drag(page, { x: 600, y: 500 }, { x: 600, y: 300 }, 10)
        await scrollSettled(page)

        expect(await documentSnapType(page)).toBe('y mandatory')
    })
})

test.describe('dragging over a section with slides', () => {
    test('up and down moves the page, and leaves the slides where they are', async ({ page }) => {
        const start = await goToSlides(page)

        await drag(page, { x: 600, y: 500 }, { x: 600, y: 200 }, 20)

        expect(await scrollY(page)).toBeGreaterThan(start)
        expect(await scrollLeftOfSlides(page)).toBe(0)
    })

    test('left and right moves the slides, and leaves the page where it is', async ({ page }) => {
        const start = await goToSlides(page)

        await drag(page, { x: 900, y: 400 }, { x: 300, y: 400 }, 20)
        await scrollSettled(page)

        expect(await scrollLeftOfSlides(page)).toBeGreaterThan(0)
        expect(await scrollY(page)).toBe(start)
        await expect(page.getByRole('navigation', { name: /slides$/ }).getByRole('button').nth(1))
            .toHaveAttribute('aria-current', 'true')
    })

    test('a click on an indicator still works after a drag', async ({ page }) => {
        await goToSlides(page)
        await drag(page, { x: 600, y: 500 }, { x: 600, y: 400 }, 10)
        await scrollSettled(page)

        await page.getByRole('navigation', { name: 'Sections' }).getByRole('button').nth(4).click()
        await scrollSettled(page)

        expect(await topOf(page, 'deep-links')).toBe(HEADER_HEIGHT)
    })

    test('a drag that starts on a button leaves the button alone', async ({ page }) => {
        await open(page)
        const toggle = page.getByRole('button', { name: 'Hide “Deep links”' })
        const box = (await toggle.boundingBox())!

        await drag(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 }, { x: box.x + 200, y: box.y }, 5)

        // The press went to the button, so the page did not move under it
        expect(await scrollY(page)).toBe(0)
    })
})
