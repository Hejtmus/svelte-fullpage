import { releaseSnapping, restoreSnappingWhenSettled } from './snapping'
import type { Axis } from './types'

/**
 * Reduced motion is honoured at the only place motion is produced: every programmatic
 * scroll jumps instead of animating, and nothing else in the library animates at all.
 */
const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

const scrollBehaviour = (animate: boolean): ScrollBehavior =>
    animate && !prefersReducedMotion() ? 'smooth' : 'instant'

/**
 * The scroll container carries `scroll-padding`, so the browser works out where a page has to
 * come to rest and nothing here needs to measure a header. Its snapping stands aside for the
 * length of an animated scroll — left on, it would re-snap mid animation and land the scroll in
 * a single jump.
 */
const scrollToPage = (
    element: HTMLElement,
    axis: Axis,
    animate = true,
    snapOwner: HTMLElement | null = null
): void => {
    const behavior = scrollBehaviour(animate)
    const token = behavior === 'smooth' && snapOwner ? releaseSnapping(snapOwner) : null

    element.scrollIntoView({
        behavior,
        block: axis === 'y' ? 'start' : 'nearest',
        inline: axis === 'x' ? 'start' : 'nearest'
    })

    if (token !== null && snapOwner) {
        restoreSnappingWhenSettled(snapOwner, axis, token)
    }
}

export { prefersReducedMotion, scrollBehaviour, scrollToPage }
