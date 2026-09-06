import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PageRegistry } from '../../src/lib/registry.svelte'
import type { Page } from '../../src/lib/types'

const host = () => {
    document.body.innerHTML = '<main></main>'
    return document.querySelector('main') as HTMLElement
}

const pageIn = (parent: HTMLElement, id: string): Page => {
    const element = document.createElement('section')
    element.id = id
    parent.append(element)
    return { id, title: id, element }
}

describe('page registry', () => {
    let parent: HTMLElement

    beforeEach(() => {
        parent = host()
    })

    it('keeps pages in DOM order, not in registration order', () => {
        const registry = new PageRegistry('y')
        const first = pageIn(parent, 'first')
        const second = pageIn(parent, 'second')
        const third = pageIn(parent, 'third')

        registry.register(third)
        registry.register(first)
        registry.register(second)

        expect(registry.pages.map(page => page.id)).toEqual(['first', 'second', 'third'])
    })

    it('unregisters exactly the page that left', () => {
        const registry = new PageRegistry('y')
        const first = pageIn(parent, 'first')
        const second = pageIn(parent, 'second')
        registry.register(first)
        const unregisterSecond = registry.register(second)

        unregisterSecond()

        expect(registry.pages.map(page => page.id)).toEqual(['first'])
        expect(registry.count).toBe(1)
    })

    it('falls back to the first page when the active one unmounts', () => {
        const registry = new PageRegistry('y')
        registry.register(pageIn(parent, 'first'))
        const unregisterSecond = registry.register(pageIn(parent, 'second'))
        registry.activate('second')

        unregisterSecond()

        expect(registry.activeId).toBe('first')
        expect(registry.activeIndex).toBe(0)
    })

    it('leads with the first page until the observer reports in', () => {
        const registry = new PageRegistry('y')
        registry.register(pageIn(parent, 'first'))
        registry.register(pageIn(parent, 'second'))

        expect(registry.activeId).toBe('first')
    })

    it('ignores activation of a page it does not know', () => {
        const registry = new PageRegistry('y')
        registry.register(pageIn(parent, 'first'))

        registry.activate('missing')

        expect(registry.activeId).toBe('first')
    })

    describe('navigation', () => {
        const scrollIntoView = vi.fn()

        beforeEach(() => {
            scrollIntoView.mockClear()
            Element.prototype.scrollIntoView = scrollIntoView
        })

        it('goes to a page by id', () => {
            const registry = new PageRegistry('y')
            registry.register(pageIn(parent, 'first'))
            const second = pageIn(parent, 'second')
            registry.register(second)

            registry.goTo('second')

            expect(registry.activeId).toBe('second')
            expect(scrollIntoView.mock.contexts[0]).toBe(second.element)
        })

        it('goes to a page by index', () => {
            const registry = new PageRegistry('y')
            registry.register(pageIn(parent, 'first'))
            const second = pageIn(parent, 'second')
            registry.register(second)

            registry.goTo(1)

            expect(registry.activeId).toBe('second')
            expect(scrollIntoView.mock.contexts[0]).toBe(second.element)
        })

        it('scrolls the horizontal axis for slides', () => {
            const registry = new PageRegistry('x')
            registry.register(pageIn(parent, 'first'))
            registry.register(pageIn(parent, 'second'))

            registry.goTo('second')

            expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'nearest', inline: 'start' }))
        })

        it('steps to the next and the previous page', () => {
            const registry = new PageRegistry('y')
            registry.register(pageIn(parent, 'first'))
            registry.register(pageIn(parent, 'second'))

            registry.next()
            expect(registry.activeId).toBe('second')

            registry.previous()
            expect(registry.activeId).toBe('first')
        })

        it('stays put at both ends and at an unknown id', () => {
            const registry = new PageRegistry('y')
            registry.register(pageIn(parent, 'first'))
            registry.register(pageIn(parent, 'second'))

            registry.previous()
            registry.goTo('missing')
            registry.goTo(9)

            expect(registry.activeId).toBe('first')
            expect(scrollIntoView).not.toHaveBeenCalled()
        })
    })
})
