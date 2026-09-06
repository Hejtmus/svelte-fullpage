import { describe, it, expect, vi } from 'vitest'
import { prefersReducedMotion, scrollToPage } from '../../src/lib/scroll'
import { setReducedMotion } from '../setup'

describe('scrolling', () => {
    it('animates by default', () => {
        const scrollIntoView = vi.fn()
        Element.prototype.scrollIntoView = scrollIntoView

        scrollToPage(document.createElement('section'), 'y')

        expect(prefersReducedMotion()).toBe(false)
        expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
    })

    it('jumps when reduced motion is requested', () => {
        setReducedMotion(true)
        const scrollIntoView = vi.fn()
        Element.prototype.scrollIntoView = scrollIntoView

        scrollToPage(document.createElement('section'), 'y')

        expect(prefersReducedMotion()).toBe(true)
        expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'instant' }))
    })

    it('jumps when the caller asks for no animation, such as an incoming hash', () => {
        const scrollIntoView = vi.fn()
        Element.prototype.scrollIntoView = scrollIntoView

        scrollToPage(document.createElement('section'), 'y', false)

        expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'instant' }))
    })
})
