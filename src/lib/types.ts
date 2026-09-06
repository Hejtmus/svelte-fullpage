import type { Snippet } from 'svelte'
import type { HTMLAttributes } from 'svelte/elements'

/** A registered section or slide. Registration is keyed by `id`, never by mount order. */
interface Page {
    id: string,
    title: string,
    element: HTMLElement
}

type Axis = 'y' | 'x'

/** Where the scrolling happens: the document itself (default) or the component's own box. */
type Scroller = 'document' | 'self'

type Snap = 'mandatory' | 'proximity' | 'none'

type PageChangeHandler = (page: Page, index: number) => void

/** Settings a `<Fullpage>` hands down to its sections. */
interface FullpageConfig {
    readonly drag: boolean
}

/** Section navigation, from `useFullpage()` or from `bind:this` on `<Fullpage>`. */
interface FullpageApi {
    readonly sections: readonly Page[],
    readonly activeSection: Page | null,
    readonly activeIndex: number,
    goTo: (target: string | number) => void,
    next: () => void,
    previous: () => void
}

/** Slide navigation, from `useFullpageSection()` or from `bind:this` on `<FullpageSection>`. */
interface SectionApi {
    readonly slides: readonly Page[],
    readonly activeSlide: Page | null,
    readonly activeIndex: number,
    goTo: (target: string | number) => void,
    next: () => void,
    previous: () => void
}

interface FullpageProps extends HTMLAttributes<HTMLDivElement> {
    scroller?: Scroller,
    snap?: Snap,
    /** CSS length kept clear at the top of every section, for a fixed site header. */
    scrollPadding?: string,
    /** Let a mouse drag scroll the sections, and the slides of every section. */
    drag?: boolean,
    indicators?: boolean,
    indicatorLabel?: string,
    /** Reflect the active section into `location.hash` and honour the hash on load. */
    hash?: boolean,
    /**
     * Writes the hash in place of the built in `history.replaceState`. SvelteKit apps pass
     * `replaceState` from `$app/navigation`, so the router keeps owning the history stack.
     */
    replaceHash?: (hash: string) => void,
    onSectionChange?: PageChangeHandler,
    children: Snippet
}

interface FullpageSectionProps extends HTMLAttributes<HTMLElement> {
    id?: string,
    title?: string,
    /** Let a mouse drag scroll this section's slides. Inherited from `<Fullpage>`. */
    drag?: boolean,
    indicators?: boolean,
    indicatorLabel?: string,
    onSlideChange?: PageChangeHandler,
    children: Snippet
}

interface FullpageSlideProps extends HTMLAttributes<HTMLDivElement> {
    id?: string,
    title?: string,
    children: Snippet
}

export type {
    Page,
    FullpageConfig,
    Axis,
    Scroller,
    Snap,
    PageChangeHandler,
    FullpageApi,
    SectionApi,
    FullpageProps,
    FullpageSectionProps,
    FullpageSlideProps
}
