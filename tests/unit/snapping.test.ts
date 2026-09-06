import { describe, it, expect, beforeEach, vi } from 'vitest'
import { releaseSnapping, restoreSnapping, restoreSnappingWhenSettled } from '../../src/lib/snapping'

describe('standing the snapping aside', () => {
    let owner: HTMLElement

    beforeEach(() => {
        owner = document.createElement('div')
        owner.style.scrollSnapType = 'y mandatory'
        document.body.append(owner)
    })

    it('turns snapping off, because it would re-snap mid animation', () => {
        releaseSnapping(owner)

        expect(owner.style.scrollSnapType).toBe('none')
    })

    it('puts the original rule back', () => {
        const token = releaseSnapping(owner)

        restoreSnapping(owner, token)

        expect(owner.style.scrollSnapType).toBe('y mandatory')
    })

    it('hands the original on when a second scroll overtakes the first', () => {
        const first = releaseSnapping(owner)
        const second = releaseSnapping(owner)

        // The overtaken scroll must not put anything back, least of all 'none'
        restoreSnapping(owner, first)
        expect(owner.style.scrollSnapType).toBe('none')

        restoreSnapping(owner, second)
        expect(owner.style.scrollSnapType).toBe('y mandatory')
    })

    it('ignores a restore for a release that already finished', () => {
        const token = releaseSnapping(owner)
        restoreSnapping(owner, token)
        owner.style.scrollSnapType = 'x proximity'

        restoreSnapping(owner, token)

        expect(owner.style.scrollSnapType).toBe('x proximity')
    })

    it('gives a scroll that never starts a grace period, then restores', async () => {
        const token = releaseSnapping(owner)

        // jsdom never moves anything, which is the same shape as an instant scroll
        restoreSnappingWhenSettled(owner, 'y', token)

        await vi.waitFor(() => expect(owner.style.scrollSnapType).toBe('y mandatory'))
    })

    it('does not restore while a slow starting scroll is still getting going', async () => {
        const token = releaseSnapping(owner)
        let offset = 0
        let frames = 0
        // Three frames before the browser gets the smooth scroll moving
        vi.spyOn(owner, 'scrollTop', 'get').mockImplementation(() => (frames++ < 3 ? 0 : (offset += 10)))

        restoreSnappingWhenSettled(owner, 'y', token)
        await new Promise(resolve => setTimeout(resolve, 120))

        expect(owner.style.scrollSnapType).toBe('none')
    })

    it('restores on a timer when frames stop arriving, as in a hidden tab', () => {
        vi.useFakeTimers()
        vi.stubGlobal('requestAnimationFrame', () => 0)
        const token = releaseSnapping(owner)

        restoreSnappingWhenSettled(owner, 'y', token)
        vi.advanceTimersByTime(2000)

        expect(owner.style.scrollSnapType).toBe('y mandatory')
        vi.unstubAllGlobals()
        vi.useRealTimers()
    })

    it('waits for the container to stop moving before restoring', async () => {
        const token = releaseSnapping(owner)
        // A container still on the move keeps the snapping off
        let offset = 0
        vi.spyOn(owner, 'scrollTop', 'get').mockImplementation(() => (offset += 10))

        restoreSnappingWhenSettled(owner, 'y', token)
        await new Promise(resolve => setTimeout(resolve, 60))
        expect(owner.style.scrollSnapType).toBe('none')

        vi.restoreAllMocks()
        await vi.waitFor(() => expect(owner.style.scrollSnapType).toBe('y mandatory'))
    })
})
