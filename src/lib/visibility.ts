import type { Page } from './types'

// Enough steps to tell a section that fills the container from one peeking in at the edge
const THRESHOLDS = [0, 0.25, 0.5, 0.75, 1]

/**
 * The page covering most of the scroll container is the active one. Ratios come from an
 * IntersectionObserver, so native scrolling — momentum, pull to refresh, find in page — is
 * left completely alone.
 */
const observeActivePage = (
    pages: readonly Page[],
    root: Element | null,
    onActive: (id: string) => void
): (() => void) => {
    const ratios = new Map<Element, number>()

    const mostVisible = (): Page | null => {
        let leader: Page | null = null
        let leadingRatio = 0
        for (const page of pages) {
            const ratio = ratios.get(page.element) ?? 0
            // Strictly greater, so a tie is settled by DOM order
            if (ratio > leadingRatio) {
                leader = page
                leadingRatio = ratio
            }
        }
        return leader
    }

    const observer = new IntersectionObserver((records) => {
        for (const record of records) {
            ratios.set(record.target, record.intersectionRatio)
        }
        const leader = mostVisible()
        if (leader) {
            onActive(leader.id)
        }
    }, { root, threshold: THRESHOLDS })

    for (const page of pages) {
        observer.observe(page.element)
    }
    return () => observer.disconnect()
}

export { observeActivePage }
