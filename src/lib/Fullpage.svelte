<script lang="ts">
    import FullpageController from './FullpageController.svelte'
    import Indicator from './Indicator/Section.svelte'
    import { setContext } from 'svelte'
    import { writable } from 'svelte/store'
    import { quartOut } from 'svelte/easing'
    import { FullpageActivity } from './stores'

    export let scrollDuration = 750
    export let pageRoundingThresholdMultiplier = 8
    export let disableDragNavigation = false
    export let disableArrowsNavigation = false
    export let easing: (t: number) => number | null = quartOut

    const sectionCount = writable(0)
    const activeSectionStore = FullpageActivity(sectionCount)
    let sections: Array<string> = []
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
</script>

<div {...$$restProps}>
    <FullpageController bind:toSection {activeSectionStore} {scrollDuration} {pageRoundingThresholdMultiplier}
                        {disableDragNavigation} {disableArrowsNavigation} {easing}>
        <slot/>
    </FullpageController>
    <Indicator {sections} activeSection={$activeSectionStore} on:goto={toSection}/>
</div>

<style>
    div {
        height: 100%;
        width: 100%;
        max-height: 100%;
        position: relative;
    }
</style>
