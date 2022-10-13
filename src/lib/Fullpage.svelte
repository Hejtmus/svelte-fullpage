<script lang="ts">
    import FullpageController from './FullpageController.svelte'
    import Indicator from './Indicator/Section.svelte'
    import { setContext } from 'svelte'
    import { writable } from 'svelte/store'
    import { FullpageActivity } from './stores'

    let userClasses = ''
    export { userClasses as class }
    export let style = ''
    export let activeSection = 0
    const sectionCount = writable(0)
    const activeSectionStore = FullpageActivity(sectionCount)
    let sections: Array<string> = []

    export let scrollDuration = 750
    export let pageRoundingThresholdMultiplier = 8
    export let disableDragNavigation = false
    export let disableArrowsNavigation = false
    export let easing: (t: number) => number | null = null

    let toSection: (event: Event) => void

    /*
    Passing data about section visibility to all sections, activeSectionStore notifies all child FullpageSections about
    changed active section, so previously active section will hide and newly active section will appear. Function getId
    is for determination sectionId for FullpageSection
     */
    setContext('section', {
        activeSectionStore,
        registerSection: (title?: string): number => {
            const id = $sectionCount
            $sectionCount++
            sections = [
                ...sections,
                title || `${id + 1}`
            ]
            return id
        },
        config: {
            scrollDuration,
            pageRoundingThresholdMultiplier,
            disableDragNavigation,
            disableArrowsNavigation,
            easing
        }
    })

    /*
    Everytime activeSection updates, this store gets new value and then all sections that subscribe,
    this is because user may want to control sections programmatically
     */
    $: activeSectionStore.toPage(activeSection)
</script>

<div class="{userClasses} svelte-fp-wrapper" style={style}>
    <FullpageController bind:toSection {activeSectionStore} {scrollDuration} {pageRoundingThresholdMultiplier}
                        {disableDragNavigation} {disableArrowsNavigation} {easing}>
        <slot/>
    </FullpageController>
    <Indicator {sections} activeSection={$activeSectionStore} on:goto={toSection}/>
</div>

<style>
    .svelte-fp-wrapper {
        height: inherit;
        width: inherit;
    }
</style>
