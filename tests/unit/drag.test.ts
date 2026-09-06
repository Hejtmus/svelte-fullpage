import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { Mock } from 'vitest'
import { dragScroll, velocityOf } from '../../src/lib/drag'
import { dragOn, pointer } from '../pointer'

describe('how fast it was let go', () => {
    it('measures the scroll it produced over the time it took', () => {
        const samples = [{ at: 1000, offset: 0 }, { at: 1020, offset: 40 }, { at: 1040, offset: 100 }]

        expect(velocityOf(samples, 1040)).toBeCloseTo(2.5)
    })

    it('is negative for a drag the other way', () => {
        const samples = [{ at: 1000, offset: 0 }, { at: 1050, offset: -50 }]

        expect(velocityOf(samples, 1050)).toBeCloseTo(-1)
    })

    it('is nothing for a pointer that was held still before it was released', () => {
        const samples = [{ at: 1000, offset: 0 }, { at: 1040, offset: 100 }]

        // Released half a second after the last movement: placed, not thrown
        expect(velocityOf(samples, 1540)).toBe(0)
    })

    it('is nothing when the whole gesture arrived in one instant', () => {
        expect(velocityOf([{ at: 1000, offset: 0 }, { at: 1000, offset: 90 }], 1000)).toBe(0)
    })

    it('is nothing without a gesture at all', () => {
        expect(velocityOf([], 1000)).toBe(0)
    })
})

describe('drag to scroll', () => {
    let surface: HTMLElement
    let scrollBy: Mock<(options: ScrollToOptions) => void>
    let onDrop: Mock<(velocity: number) => void>
    let scroller: { scrollBy: (options: ScrollToOptions) => void }

    beforeEach(() => {
        document.body.innerHTML = '<div><button type="button">go</button></div>'
        surface = document.body.firstElementChild as HTMLElement
        scrollBy = vi.fn<(options: ScrollToOptions) => void>()
        onDrop = vi.fn<(velocity: number) => void>()
        scroller = { scrollBy }
        surface.style.scrollSnapType = 'x mandatory'
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    const drag = (axis: 'x' | 'y' = 'x') =>
        dragScroll(surface, { scroller, snapOwner: surface, axis, onDrop })

    const dragBy = (from: number, to: number) => dragOn(surface, from, to)

    // The container is still in jsdom, so the settle watcher sees it stop after a few frames
    const settles = () => vi.waitFor(() => expect(surface.style.scrollSnapType).toBe('x mandatory'))

    it('scrolls by the distance the pointer travelled', () => {
        drag()

        surface.dispatchEvent(pointer('pointerdown', 100))
        window.dispatchEvent(pointer('pointermove', 60))

        expect(scrollBy).toHaveBeenCalledWith({ left: 40 })
    })

    it('scrolls the other axis when asked to', () => {
        drag('y')

        surface.dispatchEvent(pointer('pointerdown', 100, { axis: 'y' }))
        window.dispatchEvent(pointer('pointermove', 60, { axis: 'y' }))

        expect(scrollBy).toHaveBeenCalledWith({ top: 40 })
    })

    describe('deciding whose gesture it is', () => {
        it('leaves a drag along the other axis alone', () => {
            drag('x')

            // Started on this surface, but moving vertically: it belongs to the page around it
            surface.dispatchEvent(pointer('pointerdown', 100, { axis: 'y' }))
            window.dispatchEvent(pointer('pointermove', 40, { axis: 'y' }))

            expect(scrollBy).not.toHaveBeenCalled()
        })

        it('takes a drag along its own axis that started on an inner surface', () => {
            const inner = document.createElement('div')
            surface.append(inner)
            const innerScroll = vi.fn()
            dragScroll(inner, {
                scroller: { scrollBy: innerScroll },
                snapOwner: inner,
                axis: 'x',
                onDrop: vi.fn()
            })
            drag('y')

            // A vertical drag over a horizontal slide track still pans the page
            inner.dispatchEvent(pointer('pointerdown', 100, { axis: 'y' }))
            window.dispatchEvent(pointer('pointermove', 40, { axis: 'y' }))

            expect(innerScroll).not.toHaveBeenCalled()
            expect(scrollBy).toHaveBeenCalledWith({ top: 60 })
        })

        it('keeps two scrollers sharing an axis from moving together', () => {
            const inner = document.createElement('div')
            surface.append(inner)
            const innerScroll = vi.fn()
            dragScroll(inner, {
                scroller: { scrollBy: innerScroll },
                snapOwner: inner,
                axis: 'x',
                onDrop: vi.fn()
            })
            drag('x')

            dragOn(inner, 100, 60)

            expect(innerScroll).toHaveBeenCalledWith({ left: 40 })
            expect(scrollBy).not.toHaveBeenCalled()
        })
    })

    it('releases snapping for the drag', () => {
        drag()

        surface.dispatchEvent(pointer('pointerdown', 100))
        window.dispatchEvent(pointer('pointermove', 60))

        expect(surface.style.scrollSnapType).toBe('none')
    })

    describe('settling after the drop', () => {
        it('asks for the settling scroll instead of letting CSS snap instantly', () => {
            drag()

            dragBy(100, 60)

            expect(onDrop).toHaveBeenCalledOnce()
            expect(onDrop).toHaveBeenCalledWith(expect.any(Number))
        })

        it('keeps snapping off while the settling scroll runs, so it is not cut short', () => {
            drag()

            dragBy(100, 60)

            expect(surface.style.scrollSnapType).toBe('none')
        })

        it('puts snapping back once the container has stopped moving', async () => {
            drag()

            dragBy(100, 60)

            await settles()
        })

        it('survives being picked up again mid settle', async () => {
            drag()
            dragBy(100, 60)

            // Second drag starts before the first has settled
            surface.dispatchEvent(pointer('pointerdown', 60))
            window.dispatchEvent(pointer('pointermove', 20))
            expect(surface.style.scrollSnapType).toBe('none')

            window.dispatchEvent(pointer('pointerup', 20))

            await settles()
        })

        it('does not settle a drag that never passed the threshold', () => {
            drag()

            dragBy(100, 98)

            expect(onDrop).not.toHaveBeenCalled()
            expect(surface.style.scrollSnapType).toBe('x mandatory')
        })
    })

    it('ignores a wobble below the threshold', () => {
        drag()

        surface.dispatchEvent(pointer('pointerdown', 100))
        window.dispatchEvent(pointer('pointermove', 98))

        expect(scrollBy).not.toHaveBeenCalled()
        expect(surface.style.scrollSnapType).toBe('x mandatory')
    })

    it('leaves touch and pen to the browser', () => {
        drag()

        surface.dispatchEvent(pointer('pointerdown', 100, { pointerType: 'touch' }))
        window.dispatchEvent(pointer('pointermove', 60, { pointerType: 'touch' }))

        expect(scrollBy).not.toHaveBeenCalled()
    })

    it('does not start on something the reader can operate', () => {
        drag()
        const button = surface.querySelector('button') as HTMLButtonElement

        button.dispatchEvent(pointer('pointerdown', 100))
        window.dispatchEvent(pointer('pointermove', 60))

        expect(scrollBy).not.toHaveBeenCalled()
    })

    it('swallows the click a drag would otherwise end in', () => {
        drag()
        const clicked = vi.fn()
        surface.addEventListener('click', clicked)

        dragBy(100, 60)
        surface.dispatchEvent(new MouseEvent('click', { bubbles: true }))

        expect(clicked).not.toHaveBeenCalled()
    })

    it('only swallows the click of the drag that armed it', () => {
        drag()
        const clicked = vi.fn()
        surface.addEventListener('click', clicked)
        dragBy(100, 60)

        // The gesture ended somewhere that produced no click; the next press starts over
        surface.dispatchEvent(pointer('pointerdown', 60))
        window.dispatchEvent(pointer('pointerup', 60))
        surface.dispatchEvent(new MouseEvent('click', { bubbles: true }))

        expect(clicked).toHaveBeenCalledOnce()
    })

    it('lets an ordinary click through', () => {
        drag()
        const clicked = vi.fn()
        surface.addEventListener('click', clicked)

        surface.dispatchEvent(pointer('pointerdown', 100))
        window.dispatchEvent(pointer('pointerup', 100))
        surface.dispatchEvent(new MouseEvent('click', { bubbles: true }))

        expect(clicked).toHaveBeenCalled()
    })

    it('stops listening when the component goes away', () => {
        const stop = drag()

        stop()
        surface.dispatchEvent(pointer('pointerdown', 100))
        window.dispatchEvent(pointer('pointermove', 60))

        expect(scrollBy).not.toHaveBeenCalled()
    })

    it('leaves the snapping it never touched alone', () => {
        const stop = drag()

        stop()

        expect(surface.style.scrollSnapType).toBe('x mandatory')
    })

    it('puts snapping back if it goes away mid drag', () => {
        const stop = drag()

        surface.dispatchEvent(pointer('pointerdown', 100))
        window.dispatchEvent(pointer('pointermove', 60))
        stop()

        expect(surface.style.scrollSnapType).toBe('x mandatory')
        expect(document.body.style.userSelect).toBe('')
    })
})
