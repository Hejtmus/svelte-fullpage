import { releaseSnapping, restoreSnapping, restoreSnappingWhenSettled } from './snapping'
import type { Axis } from './types'

// Enough travel to tell a drag from a click that wobbled
const DRAG_THRESHOLD = 5
// Velocity is read from the tail of the gesture only: what the pointer did 300ms ago says
// nothing about how it was let go
const VELOCITY_WINDOW = 80

interface Sample {
    at: number,
    offset: number
}

/**
 * Scroll velocity in pixels per millisecond at the moment `at`, positive when the container was
 * moving forwards. Samples carry the scroll offset the drag produced, so the sign already matches
 * the scroller, and anything older than the window is ignored — a pointer held still before it was
 * released was placed, not thrown.
 */
const velocityOf = (samples: readonly Sample[], at: number): number => {
    const recent = samples.filter(sample => at - sample.at <= VELOCITY_WINDOW)
    const first = recent[0]
    const last = recent.at(-1)
    if (!first || !last) return 0
    const elapsed = last.at - first.at
    // Everything arriving in one instant carries no usable velocity
    return elapsed > 0 ? (last.offset - first.offset) / elapsed : 0
}

// Only a mouse needs the help: touch and pen already scroll the container natively, and taking
// their events over is what made 1.x fight the browser
const isDraggablePointer = (event: PointerEvent): boolean =>
    event.pointerType === 'mouse' && event.button === 0

/*
A drag belongs to the scroller whose axis it is actually moving along, so a vertical drag started
inside a horizontal slide track still pans the page. Which scroller that is can only be told once
the pointer has moved, so every surface under the press registers as a candidate for the gesture —
in bubbling order, innermost first — and the first candidate on the axis it turns out to move
along takes it. The register hangs off the pointerdown event itself, so a gesture that never
reports back is collected with it rather than wedging the next one.
*/
interface Candidate {
    axis: Axis
}

const candidates = new WeakMap<Event, Candidate[]>()

const dominantAxis = (travel: { x: number, y: number }): Axis =>
    Math.abs(travel.x) > Math.abs(travel.y) ? 'x' : 'y'

// Anything the reader operates keeps its own pointer behaviour, text selection included
const isInteractive = (target: EventTarget | null): boolean =>
    target instanceof Element &&
    target.closest('a, button, input, textarea, select, label, [contenteditable], [data-no-drag]') !== null

/** What actually scrolls: a container element, or the window in document mode. */
interface ScrollSurface {
    scrollBy: (options: ScrollToOptions) => void
}

interface DragOptions {
    scroller: ScrollSurface,
    /** Element carrying `scroll-snap-type`, released for the drag and the settle after it. */
    snapOwner: HTMLElement,
    axis: Axis,
    /**
     * Brings the container to rest on the page it was heading for. Animated, unless motion is
     * reduced. `velocity` is in pixels per millisecond, positive for a forwards throw.
     */
    onDrop: (velocity: number) => void
}

/**
 * Drag to scroll, over the native scroller rather than instead of it: the pointer moves the
 * container's own scroll offset, and dropping it lets CSS snap to the nearest page. No tween,
 * no wheel handler, nothing to accumulate.
 */
const dragScroll = (surface: HTMLElement, { scroller, snapOwner, axis, onDrop }: DragOptions): (() => void) => {
    let pointerId: number | null = null
    let origin = { x: 0, y: 0 }
    let dragging = false
    let swallowClick = false
    let release: number | null = null
    let gesture: Event | null = null
    let samples: Sample[] = []
    let travelled = 0
    const candidate: Candidate = { axis }

    const positionOf = (event: PointerEvent) => ({ x: event.clientX, y: event.clientY })

    const travelFrom = (position: { x: number, y: number }) => ({
        x: origin.x - position.x,
        y: origin.y - position.y
    })

    // Mandatory snapping pulls every incremental scroll straight back, so it is released for the
    // drag and stays released across the settling scroll that follows the drop
    const engage = (): void => {
        dragging = true
        samples = []
        travelled = 0
        release = releaseSnapping(snapOwner)
        document.body.style.userSelect = 'none'
        getSelection()?.removeAllRanges()
    }

    const onPointerDown = (event: PointerEvent): void => {
        // A fresh press is a fresh gesture: whatever the last drag armed is spent
        swallowClick = false
        if (!isDraggablePointer(event) || isInteractive(event.target)) return
        pointerId = event.pointerId
        origin = positionOf(event)
        gesture = event
        const contenders = candidates.get(event) ?? []
        contenders.push(candidate)
        candidates.set(event, contenders)
    }

    /** True once this surface owns the gesture; false while it is still anyone's. */
    const claim = (travel: { x: number, y: number }): boolean => {
        const dominant = dominantAxis(travel)
        if (Math.abs(travel[dominant]) < DRAG_THRESHOLD) return false
        const contenders = gesture ? candidates.get(gesture) ?? [] : []
        if (contenders.find(contender => contender.axis === dominant) !== candidate) {
            // Someone else's gesture: stop following it rather than joining in halfway
            pointerId = null
            return false
        }
        engage()
        return true
    }

    const onPointerMove = (event: PointerEvent): void => {
        if (event.pointerId !== pointerId) return
        const position = positionOf(event)
        const travel = travelFrom(position)
        if (!dragging && !claim(travel)) return
        origin = position
        const delta = travel[axis]
        travelled += delta
        // Only the tail of the gesture is kept, since only it is asked about later
        const at = event.timeStamp || performance.now()
        samples = [...samples.filter(sample => at - sample.at <= VELOCITY_WINDOW), { at, offset: travelled }]
        scroller.scrollBy(axis === 'x' ? { left: delta } : { top: delta })
    }

    const onPointerUp = (event: PointerEvent): void => {
        if (event.pointerId !== pointerId) return
        pointerId = null
        gesture = null
        if (!dragging) return
        dragging = false
        // A drag ends over whatever it ends over, and that must not read as a click
        swallowClick = true
        document.body.style.userSelect = ''
        onDrop(velocityOf(samples, event.timeStamp || performance.now()))
        if (release !== null) {
            restoreSnappingWhenSettled(snapOwner, axis, release)
            release = null
        }
    }

    const onClick = (event: MouseEvent): void => {
        if (!swallowClick) return
        swallowClick = false
        event.preventDefault()
        event.stopPropagation()
    }

    surface.addEventListener('pointerdown', onPointerDown)
    surface.addEventListener('click', onClick, true)
    // On the window, so a drag that leaves the surface keeps working and always ends
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    return () => {
        pointerId = null
        gesture = null
        // Only put the snapping back if this drag is the one still holding it off
        if (release !== null) {
            dragging = false
            document.body.style.userSelect = ''
            restoreSnapping(snapOwner, release)
            release = null
        }
        surface.removeEventListener('pointerdown', onPointerDown)
        surface.removeEventListener('click', onClick, true)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
        window.removeEventListener('pointercancel', onPointerUp)
    }
}

export { dragScroll, velocityOf, DRAG_THRESHOLD, VELOCITY_WINDOW }
export type { ScrollSurface, DragOptions }
