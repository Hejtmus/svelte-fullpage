<script lang="ts">
    import FullpageSectionController from './FullpageSectionController.svelte'
    import Indicator from './Indicator/Slide.svelte'
    import { getContext, onMount, setContext } from 'svelte'
    import { FullpageActivity } from './stores'
    import { writable } from 'svelte/store'

    let classes = ''

    export { classes as class }
    export let style = ''
    export let slideTitles: Array<string> | false = false
    export let activeSlide = 0
    export let disableCenter = false

    const { getId, activeSectionStore, config } = getContext('section')
    const slideCount = writable(0)
    const activeSlideStore = FullpageActivity(slideCount)

    let sectionId
    let slides = []
    let toSlide

    // Passing data about slide visibility to all slides, same principle as setContext('section',{...}) in Fullpage.svelte
    setContext('slide', {
        activeSlideStore,
        getId: () => {
            $slideCount++
            return $slideCount - 1
        }
    })

    // If user hasn't specified slideTitle, sections array will be generated with placeholder strings
    const generateFallbackSlideTitles = (slideTitles, slideCount) => {
        if (slideCount !== 0 && !slideTitles) {
            slides = []
            for (let i = 0; slideCount > i; i++) {
                slides = [
                    ...slides,
                    `Slide ${i + 1}`
                ]
            }
        }
    }

    /*
    Everytime activeSlide updates, this store gets new value and then all slides that subscribe,
    this is because user may want to control slides programmatically
     */
    $: activeSlideStore.toPage(activeSlide)

    // After DOM is ready ged sectionId
    onMount(() => {
        sectionId = getId()
    })

    // If user has specified slideTitles, then slides is overridden
    $: if (slideTitles) slides = slideTitles

    $: isActive = (sectionId === $activeSectionStore)
    $: isSlidable = $slideCount > 0
    $: generateFallbackSlideTitles(slideTitles, $slideCount)
</script>

<section class="{classes} svelte-fp-section" style={style}>
    <FullpageSectionController bind:toSlide {activeSlideStore} {isSlidable} {isActive}
                               {disableCenter} navigationCooldown={config.navigationCooldown}
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
