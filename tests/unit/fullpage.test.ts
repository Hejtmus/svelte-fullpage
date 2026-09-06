import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Demo from '../fixtures/Demo.svelte'
import { intersect, setReducedMotion } from '../setup'
import { dragOn, placeAt } from '../pointer'

const sections = [
    { id: 'one', title: 'One' },
    { id: 'two', title: 'Two' },
    { id: 'three', title: 'Three' }
]

const indicatorNames = () =>
    screen.getAllByRole('button').map(button => button.textContent?.trim())

describe('<Fullpage>', () => {
    it('gives every section an indicator button named after its title', () => {
        render(Demo, { sections })

        expect(indicatorNames()).toEqual(['One', 'Two', 'Three'])
        expect(screen.getByRole('navigation', { name: 'Sections' })).toBeTruthy()
    })

    it('keeps indicators consistent when a keyed each is filtered at runtime', async () => {
        const { rerender } = render(Demo, { sections })

        await rerender({ sections: sections.filter(section => section.id !== 'two') })

        expect(indicatorNames()).toEqual(['One', 'Three'])
        expect(screen.getByRole('button', { name: 'One' }).dataset.index).toBe('0')
        expect(screen.getByRole('button', { name: 'Three' }).dataset.index).toBe('1')
    })

    it('follows the section the observer reports as most visible', async () => {
        render(Demo, { sections })

        intersect(document.getElementById('three') as Element)
        await Promise.resolve()

        expect(screen.getByRole('button', { name: 'Three' }).getAttribute('aria-current')).toBe('true')
        expect(document.getElementById('three')?.dataset.active).toBe('true')
        expect(document.getElementById('one')?.dataset.active).toBe('false')
    })

    it('reports section changes through onSectionChange', async () => {
        const onSectionChange = vi.fn()
        render(Demo, { sections, onSectionChange })

        intersect(document.getElementById('two') as Element)
        await Promise.resolve()

        expect(onSectionChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'two' }), 1)
    })

    it('navigates by id and by index', async () => {
        const scrollIntoView = vi.fn()
        Element.prototype.scrollIntoView = scrollIntoView
        const { component } = render(Demo, { sections })

        component.goTo('three')
        expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('three'))

        component.goTo(1)
        expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('two'))

        component.next()
        expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('three'))

        component.previous()
        expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('two'))
    })

    it('clicking an indicator scrolls to its section', async () => {
        const scrollIntoView = vi.fn()
        Element.prototype.scrollIntoView = scrollIntoView
        render(Demo, { sections })

        screen.getByRole('button', { name: 'Two' }).click()

        expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('two'))
        expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
    })

    it('jumps instead of animating under prefers-reduced-motion', () => {
        setReducedMotion(true)
        const scrollIntoView = vi.fn()
        Element.prototype.scrollIntoView = scrollIntoView
        const { component } = render(Demo, { sections })

        component.goTo('two')

        expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'instant' }))
    })
})

describe('<FullpageSection> with slides', () => {
    const slides = ['alpha', 'beta']

    it('indicates slides and navigates between them', async () => {
        const scrollIntoView = vi.fn()
        Element.prototype.scrollIntoView = scrollIntoView
        const { component } = render(Demo, { sections: [sections[0]], slides })

        expect(screen.getByRole('navigation', { name: 'With slides slides' })).toBeTruthy()
        // Slide dots sit inside their section, the section dots after every section
        expect(indicatorNames()).toEqual(['alpha', 'beta', 'One', 'With slides'])

        component.goToSlide('beta')

        expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('beta'))
    })

    it('reports slide changes through onSlideChange', async () => {
        const onSlideChange = vi.fn()
        render(Demo, { sections: [sections[0]], slides, onSlideChange })

        intersect(document.getElementById('beta') as Element)
        await Promise.resolve()

        expect(onSlideChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'beta' }), 1)
    })

    describe('letting go of a drag', () => {
        // What CSS snapping does on its own here is an instant jump, so the settle is scrolled
        // deliberately — this is the animation 1.x tweened
        const draggedTrack = () => {
            const track = screen.getByRole('group', { name: 'With slides' })
            track.scrollBy = vi.fn()
            placeAt(track, 0)
            placeAt(document.getElementById('alpha') as Element, 0, -700)
            placeAt(document.getElementById('beta') as Element, 0, 20)
            dragOn(track, 400, 100, 'x')
            return track
        }

        it('animates onto the slide it landed nearest', () => {
            const scrollIntoView = vi.fn()
            Element.prototype.scrollIntoView = scrollIntoView
            render(Demo, { sections: [sections[0]], slides })

            draggedTrack()

            expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('beta'))
            expect(scrollIntoView).toHaveBeenLastCalledWith(
                expect.objectContaining({ behavior: 'smooth', inline: 'start' })
            )
        })

        it('does not pan the page as well', () => {
            const scrollIntoView = vi.fn()
            Element.prototype.scrollIntoView = scrollIntoView
            render(Demo, { sections: [sections[0]], slides })

            draggedTrack()

            // Only the slide settled: the section around it never claimed the gesture
            expect(scrollIntoView.mock.contexts).toEqual([document.getElementById('beta')])
        })

        it('lets a vertical drag over the slides scroll the page instead', () => {
            const scrollIntoView = vi.fn()
            Element.prototype.scrollIntoView = scrollIntoView
            const scrollBy = vi.fn()
            window.scrollBy = scrollBy
            render(Demo, { sections, slides })
            const track = screen.getByRole('group', { name: 'With slides' })
            track.scrollBy = vi.fn()

            dragOn(track, 400, 100, 'y')

            // The page moved, and the slides stayed where they were
            expect(scrollBy).toHaveBeenCalledWith({ top: 300 })
            expect(track.scrollBy).not.toHaveBeenCalled()
        })

        it('jumps instead, once, when motion is reduced', () => {
            setReducedMotion(true)
            const scrollIntoView = vi.fn()
            Element.prototype.scrollIntoView = scrollIntoView
            render(Demo, { sections: [sections[0]], slides })

            draggedTrack()

            expect(scrollIntoView).toHaveBeenLastCalledWith(
                expect.objectContaining({ behavior: 'instant' })
            )
        })
    })

    it('makes the slide track reachable by keyboard', () => {
        render(Demo, { sections: [sections[0]], slides })

        const track = screen.getByRole('group', { name: 'With slides' })

        expect(track.tabIndex).toBe(0)
    })
})
