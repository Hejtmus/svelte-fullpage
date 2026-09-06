import type { Axis, Page } from './types'

// Pixels per millisecond at release. Below this a drag is a placement and the nearest page wins;
// above it the reader threw the container, and the page they threw it towards wins however far
// away it still is. Roughly a third of a viewport per second.
const FLICK_VELOCITY = 0.4
// A page sitting on the rest line is the one being left, not the one being flicked to
const FLICK_EPSILON = 1

const scrollPaddingStart = (container: HTMLElement, axis: Axis): number => {
    const style = getComputedStyle(container)
    // 'auto' parses to NaN, which is the browser's own "no padding"
    return Number.parseFloat(axis === 'y' ? style.scrollPaddingTop : style.scrollPaddingLeft) || 0
}

/** Where a page comes to rest inside its scroll container, in client coordinates. */
const restLineOf = (container: HTMLElement | null, axis: Axis): number => {
    const padding = scrollPaddingStart(container ?? document.documentElement, axis)
    if (!container) return padding
    const port = container.getBoundingClientRect()
    return (axis === 'y' ? port.top : port.left) + padding
}

/**
 * The page whose start edge sits closest to that rest line — the same choice CSS snapping would
 * make, worked out in advance so the scroll onto it can be animated rather than jumped.
 */
const nearestPage = (pages: readonly Page[], axis: Axis, restLine: number): Page | null => {
    let nearest: Page | null = null
    let shortest = Number.POSITIVE_INFINITY
    for (const page of pages) {
        const rect = page.element.getBoundingClientRect()
        const distance = Math.abs((axis === 'y' ? rect.top : rect.left) - restLine)
        if (distance < shortest) {
            shortest = distance
            nearest = page
        }
    }
    return nearest
}

const startOf = (page: Page, axis: Axis): number => {
    const rect = page.element.getBoundingClientRect()
    return axis === 'y' ? rect.top : rect.left
}

/** The next page along, in the direction the container was thrown. */
const pageInDirection = (
    pages: readonly Page[],
    axis: Axis,
    restLine: number,
    forwards: boolean
): Page | null => {
    const ahead = pages.filter(page => {
        const offset = startOf(page, axis) - restLine
        return forwards ? offset > FLICK_EPSILON : offset < -FLICK_EPSILON
    })
    return (forwards ? ahead[0] : ahead.at(-1)) ?? null
}

/**
 * The page a container should settle on, given where it sits and how fast it was moving when it
 * was let go. A slow drag lands on the nearest page; a flick carries on to the next one, which
 * is what the platform does for touch and what a mouse otherwise misses out on.
 */
const pageToSettleOn = (
    pages: readonly Page[],
    axis: Axis,
    container: HTMLElement | null,
    velocity = 0
): Page | null => {
    const restLine = restLineOf(container, axis)
    if (Math.abs(velocity) >= FLICK_VELOCITY) {
        const thrown = pageInDirection(pages, axis, restLine, velocity > 0)
        if (thrown) return thrown
    }
    return nearestPage(pages, axis, restLine)
}

export { nearestPage, restLineOf, pageInDirection, pageToSettleOn, FLICK_VELOCITY }
