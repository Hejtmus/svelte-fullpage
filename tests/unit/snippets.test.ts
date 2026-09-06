import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import SnippetChildren from '../fixtures/SnippetChildren.svelte'

describe('snippet children', () => {
    it('accepts explicit children snippets', () => {
        render(SnippetChildren)

        expect(screen.getByText('explicit snippet')).toBeTruthy()
        expect(document.getElementById('explicit')).toBeTruthy()
    })
})
