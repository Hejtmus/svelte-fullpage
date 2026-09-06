import { describe, it, expect, beforeEach } from 'vitest'
import { nearestPage, pageInDirection, pageToSettleOn, restLineOf } from '../../src/lib/nearest'
import { placeAt } from '../pointer'
import type { Page } from '../../src/lib/types'

const pageAt = (id: string, top: number, left = 0): Page => {
    const element = document.createElement('section')
    placeAt(element, top, left)
    document.body.append(element)
    return { id, title: id, element }
}

describe('nearest page', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        document.documentElement.style.scrollPaddingTop = ''
    })

    it('picks the page whose edge sits closest to the rest line', () => {
        const pages = [pageAt('first', -500), pageAt('second', -80), pageAt('third', 600)]

        expect(nearestPage(pages, 'y', 0)?.id).toBe('second')
    })

    it('measures against the rest line rather than the top of the viewport', () => {
        const pages = [pageAt('first', 0), pageAt('second', 100)]

        // With a 90px header kept clear, the second page is the one nearly at rest
        expect(nearestPage(pages, 'y', 90)?.id).toBe('second')
    })

    it('measures the horizontal axis for slides', () => {
        const pages = [pageAt('first', 0, -900), pageAt('second', 0, 30)]

        expect(nearestPage(pages, 'x', 0)?.id).toBe('second')
    })

    it('has nothing to settle on without pages', () => {
        expect(nearestPage([], 'y', 0)).toBeNull()
    })

    describe('the rest line', () => {
        it('is the document scroll padding when the page itself scrolls', () => {
            document.documentElement.style.scrollPaddingTop = '64px'

            expect(restLineOf(null, 'y')).toBe(64)
        })

        it('is the top of the container plus its own padding when it scrolls', () => {
            const container = document.createElement('div')
            placeAt(container, 120, 10)
            document.body.append(container)

            expect(restLineOf(container, 'y')).toBe(120)
            expect(restLineOf(container, 'x')).toBe(10)
        })
    })

    it('settles on the nearest page of the container that scrolls', () => {
        const pages = [pageAt('first', -400), pageAt('second', 20)]

        expect(pageToSettleOn(pages, 'y', null)?.id).toBe('second')
    })

    describe('a page that was thrown rather than placed', () => {
        // The first page is barely off the rest line, so distance alone would always pick it
        const thrown = () => [pageAt('first', -20), pageAt('second', 700), pageAt('third', 1400)]

        it('carries on to the next page when let go at speed', () => {
            expect(pageToSettleOn(thrown(), 'y', null, 0.8)?.id).toBe('second')
        })

        it('carries back when thrown the other way', () => {
            const pages = [pageAt('first', -700), pageAt('second', 20), pageAt('third', 720)]

            expect(pageToSettleOn(pages, 'y', null, -0.8)?.id).toBe('first')
        })

        it('lands on the nearest page when it was only nudged', () => {
            expect(pageToSettleOn(thrown(), 'y', null, 0.1)?.id).toBe('first')
        })

        it('has nowhere to carry on to at the end, so it settles back', () => {
            const pages = [pageAt('first', -700), pageAt('second', -20)]

            expect(pageToSettleOn(pages, 'y', null, 0.8)?.id).toBe('second')
        })

        it('ignores a page sitting on the rest line as somewhere to be thrown to', () => {
            const pages = [pageAt('first', 0), pageAt('second', 700)]

            expect(pageInDirection(pages, 'y', 0, true)?.id).toBe('second')
        })
    })
})
