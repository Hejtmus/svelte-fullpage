<script lang="ts">
    import FullpageSectionController from './FullpageSectionController.svelte'
    import Indicator from './Indicator/Slide.svelte'
    import { getContext, onMount, setContext } from 'svelte'
    import { FullpageActivity } from './stores'
    import { writable } from 'svelte/store'

    export let title = ''
    export let disableCenter = false

    const { registerSection, activeSectionStore, config } = getContext('section')
    const slideCount = writable(0)
    const activeSlideStore = FullpageActivity(slideCount)

    let sectionId: number
    let slides: Array<string> = []
    let toSlide: (event: Event) => void

    // Passing data about slide visibility to all slides, same principle as setContext('section',{...}) in Fullpage.svelte
    setContext('slide', {
        activeSlideStore,
        registerSlide: (title?: string): void => {
            const id = $slideCount
            $slideCount++
            slides = [
                ...slides,
                title || `${id + 1}`
            ]
        }
    })

    onMount(() => {
        sectionId = registerSection(title)
    })

    $: isActive = (sectionId === $activeSectionStore)
    $: isSlidable = $slideCount > 0
</script>

<section>
    <FullpageSectionController  bind:toSlide {activeSlideStore} {isSlidable} {isActive}
                               {disableCenter} scrollDuration={config.scrollDuration}
                               disableDragNavigation={config.disableDragNavigation}
                               disableArrowsNavigation={config.disableArrowsNavigation}
                               pageRoundingThresholdMultiplier={config.pageRoundingThresholdMultiplier}
                               easing={config.easing} {...$$restProps}>
        <slot/>
    </FullpageSectionController>
    {#if isSlidable}
        <Indicator {slides} activeSlide={$activeSlideStore} on:goto={toSlide}/>
    {/if}
</section>

<style>
    section {
        height: inherit;
        width: inherit;
        position: relative;
    }
</style>
