<script lang="ts">
    import Indicators from './Indicator/Indicators.svelte'
    import { PageRegistry } from './registry.svelte'
    import { consumeConfig, consumeSections, provideSlides, toSectionApi } from './context'
    import { observeActivePage } from './visibility'
    import { dragScroll } from './drag'
    import { pageToSettleOn } from './nearest'
    import { untrack } from 'svelte'
    import type { FullpageSectionProps } from './types'

    const sections = consumeSections()
    const config = consumeConfig()
    const generatedId = $props.id()

    let {
        id = generatedId,
        title = '',
        drag = config.drag,
        indicators = true,
        indicatorLabel,
        onSlideChange,
        class: className,
        children,
        ...rest
    }: FullpageSectionProps = $props()

    const slides = new PageRegistry('x')
    provideSlides(slides)

    /** Slide navigation for consumers holding the section through `bind:this`. */
    export const api = toSectionApi(slides)
    export const goTo = (target: string | number) => slides.goTo(target)
    export const next = () => slides.next()
    export const previous = () => slides.previous()

    let element: HTMLElement | null = $state(null)
    let track: HTMLDivElement | null = $state(null)

    $effect(() => {
        if (!element) return
        return sections.register({ id, title, element })
    })

    const index = $derived(sections.pages.findIndex(page => page.id === id))
    const isActive = $derived(sections.activeId === id)
    const isSlidable = $derived(slides.count > 0)

    $effect(() => {
        const pages = slides.pages
        if (!track || pages.length === 0) return
        return observeActivePage(pages, track, slideId => slides.activate(slideId))
    })

    $effect(() => {
        slides.snapOwner = track
    })

    const settleOnNearestSlide = (velocity: number): void => {
        const slide = pageToSettleOn(slides.pages, 'x', track, velocity)
        if (slide) {
            slides.goTo(slide.id)
        }
    }

    $effect(() => {
        if (!drag || !track || !isSlidable) return
        return dragScroll(track, {
            scroller: track,
            snapOwner: track,
            axis: 'x',
            onDrop: settleOnNearestSlide
        })
    })

    // A scrollable region has to be reachable by keyboard, but only once it really scrolls —
    // which is known at runtime, when the first slide has registered
    $effect(() => {
        if (!track) return
        track.tabIndex = isSlidable ? 0 : -1
    })

    $effect(() => {
        const slide = slides.active
        if (!slide) return
        untrack(() => onSlideChange?.(slide, slides.activeIndex))
    })
</script>

<section bind:this={element} {id} data-index={index} data-active={isActive} {...rest}
    class={['fullpage-section', className]}>
    <div bind:this={track} class="fullpage-track" data-slidable={isSlidable}
        role={isSlidable ? 'group' : undefined} aria-label={isSlidable ? (title || 'Slides') : undefined}>
        {@render children()}
    </div>
    {#if isSlidable && indicators}
        <Indicators registry={slides} label={indicatorLabel ?? `${title || 'Section'} slides`}
            fallbackLabel="Slide" orientation="horizontal" position="absolute"/>
    {/if}
</section>

<style>
    .fullpage-section {
        position: relative;
        display: flex;
        flex-direction: column;
        inline-size: 100%;
        /* svh rather than vh, so mobile browser chrome appearing does not resize every section */
        min-block-size: var(--fullpage-section-height, calc(100svh - var(--fullpage-scroll-padding, 0px)));
        scroll-snap-align: start;
        scroll-snap-stop: var(--fullpage-snap-stop, normal);
    }
    .fullpage-track {
        flex: 1;
        display: flex;
        inline-size: 100%;
        min-block-size: 0;
    }
    /* Slides turn the track into a horizontal scroller with the same snapping, one axis over */
    .fullpage-track[data-slidable='true'] {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x mandatory;
        overscroll-behavior-x: contain;
    }
    .fullpage-track[data-slidable='true']:focus-visible {
        outline: var(--fullpage-track-focus-ring, 2px solid currentColor);
        outline-offset: -2px;
    }
    /* Without slides the track is only a pass through, and its child owns the layout */
    .fullpage-track[data-slidable='false'] {
        flex-direction: column;
    }
</style>
