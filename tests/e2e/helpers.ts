import type { Page } from '@playwright/test'

const HEADER_HEIGHT = 64

/**
 * Opens the demo and waits for it to come alive. The server renders the sections, but the
 * indicators are built from client side registration, so their appearance is hydration showing.
 */
const open = async (page: Page, path = '/'): Promise<void> => {
    await page.goto(path)
    await page.getByRole('navigation', { name: 'Sections' }).getByRole('button').first().waitFor()
    await scrollSettled(page)
}

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))

const scrollLeftOfSlides = (page: Page) =>
    page.evaluate(() => document.querySelector('.fullpage-track[data-slidable="true"]')?.scrollLeft ?? -1)

const documentSnapType = (page: Page) =>
    page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)

/** Where a section currently sits relative to the viewport top. */
const topOf = (page: Page, id: string) =>
    page.evaluate(section => Math.round(document.getElementById(section)!.getBoundingClientRect().top), id)

/** Waits for the scroll to stop, however it was started. */
const scrollSettled = async (page: Page): Promise<void> => {
    await page.waitForFunction(() => new Promise<boolean>(resolve => {
        let previous = -1
        let still = 0
        const check = () => {
            still = window.scrollY === previous ? still + 1 : 0
            previous = window.scrollY
            still >= 3 ? resolve(true) : requestAnimationFrame(check)
        }
        requestAnimationFrame(check)
    }))
}

/** A real mouse drag: press, move in steps, release. `steps` decides how fast it goes. */
const drag = async (
    page: Page,
    from: { x: number, y: number },
    to: { x: number, y: number },
    steps = 20
): Promise<void> => {
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps })
    await page.mouse.up()
}

export { HEADER_HEIGHT, drag, documentSnapType, open, scrollLeftOfSlides, scrollSettled, scrollY, topOf }
