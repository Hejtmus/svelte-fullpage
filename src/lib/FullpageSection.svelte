<script lang="ts">
    import FullpageSectionController from './FullpageSectionController.svelte'
    import Indicator from './Indicator/Slide.svelte'
    import { getContext, onMount, setContext } from 'svelte'
    import { FullpageActivity, FullpageExternalController } from './stores'
    import { writable } from 'svelte/store'
    import type { navigationFunction, SectionContext, SlideContext } from '$lib/types'

    export let title = ''
    export let disableCentering = false

    const { registerSection, activeSectionStore, config }: SectionContext = getContext('section')
    const slideCount = writable(0)
    const activeSlideStore = FullpageActivity(slideCount)
    export const controller = FullpageExternalController(activeSlideStore)

    let sectionId: number
    let slides: Array<string> = []
    let toSlide: navigationFunction

    // Passing data about slide visibility to all slides, same principle as setContext('section',{...}) in Fullpage.svelte
    const slideContext: SlideContext = {
        activeSlideStore,
        registerSlide: (title?: string): void => {
            const id = $slideCount
            $slideCount++
            slides = [
                ...slides,
                title || `${id + 1}`
            ]
        }
    }
    setContext('slide', slideContext)

    onMount(() => {
        sectionId = registerSection(title)
    })

    $: isActive = (sectionId === $activeSectionStore)
    $: isSlidable = $slideCount > 0
</script>

<section {...$$restProps}>
    <FullpageSectionController bind:toSlide externalController={controller} {activeSlideStore} {isSlidable} {isActive}
                               {disableCentering} scrollDuration={config.scrollDuration}
                               disableDragNavigation={config.disableDragNavigation}
                               disableArrowsNavigation={config.disableArrowsNavigation}
                               pageRoundingThresholdMultiplier={config.pageRoundingThresholdMultiplier}
                               easing={config.easing}>
        <slot/>
    </FullpageSectionController>
    {#if isSlidable}
        <Indicator {slides} activeSlide={$activeSlideStore} on:goto={toSlide}/>
    {/if}
</section>

<style>
    section {
        height: 100%;
        width: 100%;
        position: relative;
    }
</style>
