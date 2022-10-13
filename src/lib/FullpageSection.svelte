<script lang="ts">
    import FullpageSectionController from './FullpageSectionController.svelte'
    import Indicator from './Indicator/Slide.svelte'
    import { getContext, onMount, setContext } from 'svelte'
    import { FullpageActivity } from './stores'
    import { writable } from 'svelte/store'

    let userClasses = ''
    export { userClasses as class }
    export let style = ''
    export let title = ''
    export let activeSlide = 0
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

    /*
    Everytime activeSlide updates, this store gets new value and then all slides that subscribe,
    this is because user may want to control slides programmatically
     */
    $: activeSlideStore.toPage(activeSlide)

    onMount(() => {
        sectionId = registerSection(title)
    })

    $: isActive = (sectionId === $activeSectionStore)
    $: isSlidable = $slideCount > 0
</script>

<section class="{userClasses} svelte-fp-section" style={style}>
    <FullpageSectionController bind:toSlide {activeSlideStore} {isSlidable} {isActive}
                               {disableCenter} scrollDuration={config.scrollDuration}
                               disableDragNavigation={config.disableDragNavigation}
                               disableArrowsNavigation={config.disableArrowsNavigation}
                               pageRoundingThresholdMultiplier={config.pageRoundingThresholdMultiplier}>
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
        overflow-y: hidden;
    }
</style>
