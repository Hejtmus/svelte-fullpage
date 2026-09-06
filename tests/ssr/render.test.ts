import { describe, it, expect } from 'vitest'
import { render } from 'svelte/server'
import Demo from '../fixtures/Demo.svelte'

// The library touches window, document and IntersectionObserver only from $effect, so a server
// render has to come out clean without any of them existing
describe('server rendering', () => {
    const { body } = render(Demo, {
        props: {
            sections: [
                { id: 'one', title: 'One' },
                { id: 'two', title: 'Two' }
            ],
            slides: ['alpha']
        }
    })

    it('renders the sections with their ids, ready to be deep linked', () => {
        expect(body).toContain('id="one"')
        expect(body).toContain('id="two"')
        expect(body).toContain('One body')
    })

    it('renders the slides inside their section', () => {
        expect(body).toContain('id="alpha"')
        expect(body).toContain('class="fullpage-slide')
    })

    it('leaves the indicators to the client, since nothing has registered yet', () => {
        expect(body).not.toContain('aria-current')
    })
})
