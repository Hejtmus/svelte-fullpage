import type { Axis, Snap } from './types'

// Three still frames is a stopped scroll. A browser takes a frame or two to get a smooth scroll
// moving, so stillness only counts once it has, and the two caps cover a scroll that never starts
// and one that never ends.
const SETTLE_FRAMES = 3
const START_GRACE = 20
const SETTLE_LIMIT = 120
// Frames stop arriving altogether in a hidden or throttled tab, where timers still do: without
// this the snapping would stay off for as long as the tab was in the background
const SETTLE_GUARD = 2000

interface Release {
    original: string,
    token: number
}

/*
Mandatory snapping re-snaps the container on every step of an animated scroll, which turns a
smooth scroll into a jump. Snapping is therefore released for the length of such a scroll and put
back once the container has stopped. Releases are tracked per container and carry a token, so
overlapping scrolls hand the original value on rather than saving `none` over it.
*/
const releases = new WeakMap<HTMLElement, Release>()
let lastToken = 0

const releaseSnapping = (owner: HTMLElement): number => {
    const token = ++lastToken
    const original = releases.get(owner)?.original ?? owner.style.scrollSnapType
    releases.set(owner, { original, token })
    owner.style.scrollSnapType = 'none'
    return token
}

const restoreSnapping = (owner: HTMLElement, token: number): void => {
    const release = releases.get(owner)
    // A newer scroll owns the release now, and will put the original back itself
    if (!release || release.token !== token) return
    releases.delete(owner)
    owner.style.scrollSnapType = release.original
}

/** Puts the snapping back once the container has stopped moving. */
const restoreSnappingWhenSettled = (owner: HTMLElement, axis: Axis, token: number): void => {
    let previous = Number.NaN
    let still = 0
    let frames = 0
    let moving = false
    const guard = setTimeout(() => restoreSnapping(owner, token), SETTLE_GUARD)

    const hasSettled = (): boolean => {
        if (moving) return still >= SETTLE_FRAMES || frames >= SETTLE_LIMIT
        // Nothing has moved yet: the scroll is either about to start, or was never animated
        return frames >= START_GRACE
    }

    const check = (): void => {
        const offset = axis === 'y' ? owner.scrollTop : owner.scrollLeft
        if (!Number.isNaN(previous) && offset !== previous) {
            moving = true
        }
        still = offset === previous ? still + 1 : 0
        previous = offset
        frames += 1
        if (hasSettled()) {
            clearTimeout(guard)
            restoreSnapping(owner, token)
            return
        }
        requestAnimationFrame(check)
    }

    requestAnimationFrame(check)
}

/**
 * In document mode the page itself is the scroll container, and only the document element can
 * carry its snap rules. They are restored on unmount, so a route that leaves `<Fullpage>`
 * behind scrolls normally again.
 */
const applyDocumentSnapping = (snap: Snap, scrollPadding: string): (() => void) => {
    const root = document.documentElement
    const previous = {
        snapType: root.style.scrollSnapType,
        scrollPadding: root.style.scrollPaddingTop
    }

    root.style.scrollSnapType = snap === 'none' ? '' : `y ${snap}`
    root.style.scrollPaddingTop = scrollPadding

    return () => {
        root.style.scrollSnapType = previous.snapType
        root.style.scrollPaddingTop = previous.scrollPadding
    }
}

export { applyDocumentSnapping, releaseSnapping, restoreSnapping, restoreSnappingWhenSettled }
