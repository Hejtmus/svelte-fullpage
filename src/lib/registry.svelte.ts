import { untrack } from 'svelte'
import { scrollToPage } from './scroll'
import type { Axis, Page } from './types'

/**
 * Pages are kept in the order their elements appear in the document rather than in the order
 * they registered, so late mounts, reorders and filtered `{#each}` blocks stay in sync with
 * the indicators.
 */
const byDomOrder = (one: Page, other: Page): number =>
    one.element.compareDocumentPosition(other.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1

/** The shared machinery behind sections and slides: the axis is all that differs. */
class PageRegistry {
    // Raw state: the array is always replaced wholesale, and its entries hold DOM nodes
    #pages = $state.raw<Page[]>([])
    #activeId = $state<string | null>(null)
    #snapOwner: HTMLElement | null = null
    readonly #axis: Axis

    constructor (axis: Axis) {
        this.#axis = axis
    }

    /** The scroll container these pages live in; its snapping stands aside for animated scrolls. */
    get snapOwner (): HTMLElement | null {
        return this.#snapOwner
    }

    set snapOwner (owner: HTMLElement | null) {
        this.#snapOwner = owner
    }

    get pages (): readonly Page[] {
        return this.#pages
    }

    get count (): number {
        return this.#pages.length
    }

    /** Until the observer reports in — during SSR, or before the first frame — the first page leads. */
    get activeId (): string | null {
        return this.#activeId ?? this.#pages[0]?.id ?? null
    }

    get activeIndex (): number {
        const activeId = this.activeId
        return this.#pages.findIndex(page => page.id === activeId)
    }

    get active (): Page | null {
        return this.#pages[this.activeIndex] ?? null
    }

    /**
     * Returns the matching unregistration, which `$effect` calls when the page unmounts.
     * Both halves run untracked: they are called from the registering component's own effect,
     * which must not come to depend on the list it is writing to.
     */
    register (page: Page): () => void {
        untrack(() => {
            this.#pages = [...this.#withoutId(page.id), page].sort(byDomOrder)
        })
        return () => untrack(() => {
            this.#pages = this.#withoutId(page.id)
            if (this.#activeId === page.id) {
                this.#activeId = null
            }
        })
    }

    /** Reports what the observer sees; unknown ids are ignored so stale reports cannot stick. */
    activate (id: string): void {
        if (this.#pages.some(page => page.id === id)) {
            this.#activeId = id
        }
    }

    goTo (target: string | number, animate = true): void {
        const page = this.#resolve(target)
        if (!page) return
        // Claimed straight away so indicators react to the click, not to the scroll landing
        this.#activeId = page.id
        scrollToPage(page.element, this.#axis, animate, this.#snapOwner)
    }

    next (): void {
        this.goTo(this.activeIndex + 1)
    }

    previous (): void {
        this.goTo(this.activeIndex - 1)
    }

    #resolve (target: string | number): Page | null {
        const page = typeof target === 'number'
            ? this.#pages[target]
            : this.#pages.find(known => known.id === target)
        return page ?? null
    }

    #withoutId (id: string): Page[] {
        return this.#pages.filter(page => page.id !== id)
    }
}

export { PageRegistry }
