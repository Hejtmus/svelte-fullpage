<script lang="ts">
    import Indicators from './Indicator/Indicators.svelte'
    import { PageRegistry } from './registry.svelte'
    import { provideConfig, provideSections, toFullpageApi } from './context'
    import { observeActivePage } from './visibility'
    import { applyDocumentSnapping } from './snapping'
    import { dragScroll } from './drag'
    import { pageToSettleOn } from './nearest'
    import { hashTarget, writeHashTarget } from './hash'
    import { untrack } from 'svelte'
    import type { FullpageProps } from './types'

    let {
        scroller = 'document',
        snap = 'mandatory',
        scrollPadding = '0px',
        drag = true,
        indicators = true,
        indicatorLabel = 'Sections',
        hash = false,
        replaceHash,
        onSectionChange,
        class: className,
        children,
        ...rest
    }: FullpageProps = $props()

    const sections = new PageRegistry('y')
    provideSections(sections)
    // A getter, so a section reads the current value rather than the one at its mount
    provideConfig({ get drag () { return drag } })

    /** Section navigation for consumers holding the component through `bind:this`. */
    export const api = toFullpageApi(sections)
    export const goTo = (target: string | number) => sections.goTo(target)
    export const next = () => sections.next()
    export const previous = () => sections.previous()

    let container: HTMLDivElement | null = $state(null)
    const isContained = $derived(scroller === 'self')

    // Animated navigation has to know whose snapping to stand aside from
    $effect(() => {
        sections.snapOwner = isContained ? container : document.documentElement
    })

    // Document mode has no element of its own to style, so the rules go on the document element
    $effect(() => {
        if (isContained) return
        return applyDocumentSnapping(snap, scrollPadding)
    })

    // Watches whatever actually scrolls: the container in contained mode, the viewport otherwise
    $effect(() => {
        const pages = sections.pages
        if (pages.length === 0) return
        return observeActivePage(pages, isContained ? container : null, id => sections.activate(id))
    })

    // Dragging pans whatever scrolls, and on release animates onto the section it landed
    // nearest — the settle CSS snapping would otherwise perform as an instant jump
    const settleOnNearestSection = (velocity: number): void => {
        const section = pageToSettleOn(sections.pages, 'y', isContained ? container : null, velocity)
        if (section) {
            sections.goTo(section.id)
        }
    }

    $effect(() => {
        if (!drag || !container) return
        return dragScroll(container, {
            scroller: isContained ? container : window,
            snapOwner: isContained ? container : document.documentElement,
            axis: 'y',
            onDrop: settleOnNearestSection
        })
    })

    $effect(() => {
        const section = sections.active
        if (!section) return
        untrack(() => onSectionChange?.(section, sections.activeIndex))
    })

    // Honoured once, as soon as there are sections to match the hash against. The jump is
    // instant because it stands in for the browser's own navigation to an anchor.
    let hashApplied = false
    $effect(() => {
        if (!hash || hashApplied || sections.count === 0) return
        hashApplied = true
        const target = hashTarget()
        if (target) {
            untrack(() => sections.goTo(target, false))
        }
    })

    // The section the page loaded on is left alone: it is already in the address bar if it was
    // linked to, and writing during hydration would reach a router that has not started yet
    let hashWritten: string | null = null
    $effect(() => {
        const id = sections.activeId
        if (!hash || !id || hashWritten === id) return
        const isLoadState = hashWritten === null
        hashWritten = id
        if (!isLoadState) {
            writeHashTarget(id, replaceHash)
        }
    })
</script>

<div bind:this={container} data-scroller={scroller} data-snap={snap}
    style:--fullpage-scroll-padding={scrollPadding} {...rest} class={['fullpage', className]}>
    {@render children()}
    {#if indicators}
        <Indicators registry={sections} label={indicatorLabel} fallbackLabel="Section"
            orientation="vertical" position={isContained ? 'absolute' : 'fixed'}/>
    {/if}
</div>

<style>
    .fullpage {
        position: relative;
        inline-size: 100%;
    }
    /* Contained mode is the opt out: an isolated scrolling box instead of the document */
    .fullpage[data-scroller='self'] {
        block-size: var(--fullpage-height, 100svh);
        overflow-y: auto;
        overflow-x: hidden;
        scroll-padding-block-start: var(--fullpage-scroll-padding, 0px);
        overscroll-behavior-y: contain;
    }
    .fullpage[data-scroller='self'][data-snap='mandatory'] {
        scroll-snap-type: y mandatory;
    }
    .fullpage[data-scroller='self'][data-snap='proximity'] {
        scroll-snap-type: y proximity;
    }
</style>
