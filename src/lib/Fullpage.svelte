<script lang="ts">
    import FullpageController from './FullpageController.svelte'
    import Indicator from './Indicator/Section.svelte';
    import { setContext } from "svelte";
    import { writable } from "svelte/store";
    import { FullpageActivity } from './stores'

    let defaultClasses = '';
    export {defaultClasses as class}
    export let style = '';
    //number that hold which section is active
    export let activeSection = 0;
    const sectionCount = writable(0)
    const activeSectionStore = FullpageActivity(sectionCount)
    let sections: Array<string> | false = []

    export let navigationCooldown = 750
    export let pageRoundingThresholdMultiplier = 8
    export let disableDragNavigation = false
    export let disableArrowsNavigation = false
    export let disablePullDownToRefresh = true
    export let sectionTitles: Array<string> | false = false

    let toSection

    /*
    Passing data about section visibility to all sections, activeSectionStore notifies all child FullpageSections about
    changed active section, so previously active section will hide and newly active section will appear. Function getId
    is for determination sectionId for FullpageSection
     */
    setContext('section', {
        activeSectionStore,
        getId: ()=>{
            $sectionCount++;
            return $sectionCount - 1;
        },
        config: {
            navigationCooldown,
            pageRoundingThresholdMultiplier,
            disableDragNavigation,
            disableArrowsNavigation
        }
    })

    // If user hasn't specified sectionTitle, sections array will be generated with fallback strings
    const generateFallbackSectionTitles = (sectionTitles, sectionCount) => {
        if (sectionCount !== 0 && !sectionTitles) {
            sections = [];
            for (let i = 0; sectionCount > i; i++) {
                sections = [
                    ...sections,
                    `Section ${i+1}`
                ];
            }
        }
    }

    /*
    Everytime activeSection updates, this store gets new value and then all sections that subscribe,
    this is because user may want to control sections programmatically
     */
    $: activeSectionStore.toPage(activeSection)

    // If user has specified sectionTitles, then sections is overridden
    $: if (sectionTitles) sections = sectionTitles;

    $: generateFallbackSectionTitles(sectionTitles, $sectionCount);
</script>

<div class="{defaultClasses} svelte-fp-wrapper" style={style}>
    <FullpageController bind:toSection {activeSectionStore} {navigationCooldown} {pageRoundingThresholdMultiplier}
                        {disableDragNavigation} {disableArrowsNavigation} {disablePullDownToRefresh}>
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
