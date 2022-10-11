<script lang="ts">
    import Indicator from './Indicator/Section.svelte';
    import { setContext } from "svelte";
    import {writable} from "svelte/store";
    import { FullpageActivity } from './stores'
    //defining variable that will hold class value, that will be passed into this component's wrapper
    let defaultClasses = '';

    //exporting classes, for passing classes into wrapper
    export {defaultClasses as class};
    export let style = '';
    //number that hold which section is active
    export let activeSection = 0;
    const sectionCount = writable(0);
    const activeSectionStore = FullpageActivity(sectionCount)
    export let sectionTitles = false;
    let sections: Array<string> | false = [];
    // duration of animation and scroll cooldown in milliseconds
    export let transitionDuration = 500;
    // enables scrolling using arrows
    export let arrows = false;
    // enables scrolling using drag
    export let drag = false;
    /*
    Distance in px, if values from events emitted by user behavior exceed this thresholds, function for handling drag (by
    cursor) or touch will be triggered.
     */
    export let dragThreshold = 100;
    export let touchThreshold = 75;
    export let pullDownToRefresh = false;

    // Auxiliary variables that make possible drag and scroll feature
    let dragging = false;
    let dragPosition = 0
    let dragStartScroll = 0
    let touchStartPosition

    //extending exported classes with wrapper class
    let classes = `${defaultClasses} svelte-fp-wrapper`;
    let recentScroll = 0;
    let fullpage
    //setting section visible
    let active = true;

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
        }
    })

    const scrollUp = () => {
        activeSectionStore.previousPage()
        updateFullpageScroll($activeSectionStore)
    };
    const scrollDown = () => {
        activeSectionStore.nextPage()
        updateFullpageScroll($activeSectionStore)
    };
    const toSection = (event) => {
        const sectionId = event.detail
        activeSectionStore.toPage(sectionId)
        updateFullpageScroll($activeSectionStore)
    };
    const updateFullpageScroll = (activeSection) => {
        if (fullpage) {
            fullpage.scrollTo({
                top: activeSection * fullpage.clientHeight
            })
        }
    }
    // handling arrow event
    const handleKey = (event) => {
        if (arrows) {
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault()
                    scrollDown();
                    break;
                case 'ArrowUp':
                    event.preventDefault()
                    scrollUp();
                    break;
            }
        }
    };
    const handleWheel = (event) => {
        const now = Date.now()
        const deltaY = event.deltaY
        if (Math.abs(deltaY) > 20 && now - recentScroll >= transitionDuration * 2) {
            handleWheelEnd(deltaY)
            recentScroll = now
        }
    }
    const handleWheelEnd = (wheelDelta) => {
        const hasScrolledUp = wheelDelta < 0
        hasScrolledUp ? scrollUp() : scrollDown()
    }
    const handleDragStart = (event) => {
        dragPosition = event.clientY
        dragStartScroll = fullpage.scrollTop
        dragging = true
    };
    const handleDragging = (event) => {
        if (dragging) {
            fullpage.scrollTo({
                top: dragStartScroll - (event.clientY - dragPosition)
            })
        }
    };
    const handleDragEnd = () => {
        dragging = false
        const hasScrolledUp = dragStartScroll > fullpage.scrollTop
        const scrollDelta = fullpage.scrollTop % fullpage.clientHeight
        const hasExceededScrollRoundThreshold = Math.abs(scrollDelta) > fullpage.clientHeight / 4
        if (hasExceededScrollRoundThreshold) {
            hasScrolledUp ? scrollUp() : scrollDown()
        }
    };
    const handleTouchStart = (event) => {
        touchStartPosition = event.touches[0].screenY;
    };
    // Compare touch start and end Y coordinates, if difference exceeds threshold, scroll function is triggered
    const handleTouchMove = (event) => {
        // Timer is used for preventing scrolling multiple sections
        const now = Date.now()
        const touchEndPosition = event.touches[0].screenY
        if (transitionDuration < now - recentScroll) {
            const touchDelta = touchStartPosition - touchEndPosition
            const hasScrolledUp = touchStartPosition < touchEndPosition
            if (Math.abs(touchDelta) > touchThreshold) {
                hasScrolledUp ? scrollUp() : scrollDown()
                recentScroll = now
            }
        }
    };

    // If user hasn't specified sectionTitle, sections array will be generated with fallback strings
    const generateFallbackSectionTitles = (sectionTitles, sectionCount) => {
        if (sectionCount !== 0 && !sectionTitles) {
            sections = [];
            for (let i = 0; sectionCount > i; i++) {
                console.log(sections)
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

<svelte:window on:keydown={ (event)=>handleKey(event) }/> <!-- Necessity when listening to window events -->
<svelte:body class:svelte-fp-disable-pull-refresh={pullDownToRefresh}/> <!-- disables slideDownToRefresh feature -->


<div class={classes} style={style}>
    <div class="svelte-fp-container" bind:this={fullpage} on:wheel|preventDefault={handleWheel} on:mousedown={handleDragStart}
         on:mousemove|preventDefault={handleDragging} on:mouseup={handleDragEnd} on:mouseleave={handleDragEnd}
         on:drag={ ()=>{return false} } on:touchstart|preventDefault={handleTouchStart} on:touchmove|preventDefault={handleTouchMove}>
        <slot />
    </div>
    <Indicator {sections} bind:activeSection={$activeSectionStore} on:goto={toSection}/>
</div>

<style>
    .svelte-fp-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        width: 100%;
    }
    .svelte-fp-container {
        height: inherit;
        width: inherit;
        position: relative;
        overflow-y: scroll;
        scroll-behavior: smooth;
        user-select: none;
    }
    .svelte-fp-container::-webkit-scrollbar {
        width: 0;
        background: transparent;
    }
    .svelte-fp-disable-pull-refresh {
        overscroll-behavior: contain;
    }
</style>
