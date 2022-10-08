<script>
    import Indicator from './Indicator/Section.svelte';
    import { setContext } from "svelte";
    import {writable} from "svelte/store";
    //defining variable that will hold class value, that will be passed into this component's wrapper
    let defaultClasses = '';

    //exporting classes, for passing classes into wrapper
    export {defaultClasses as class};
    export let style = '';
    //number that hold which section is active
    export let activeSection = 0;
    const activeSectionStore = writable(activeSection)
    let sectionCount = 0;
    export let sectionTitles = false;
    let sections = [];
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
            sectionCount++;
            return sectionCount-1;
        }
    })

    //function that handles scroll and sets scroll cooldown based on animation duration
    const handleScroll = (event) => {
        //getting direction of scroll, if negative, scroll up, if positive, scroll down
        let deltaY = event.deltaY;
        let timer = new Date().getTime();
        //if cooldown time is up, fullpage is scrollable again
        if (transitionDuration < timer-recentScroll) {
            recentScroll = timer;
            if (deltaY < 0) {
                scrollUp()
            } else if (deltaY > 0) {
                scrollDown()
            }
        }
    };
    // scroll up effect, only when it's possible
    const scrollUp = async () => {
        if ($activeSectionStore > 0){
            activeSection--;
            fullpage.scrollTop -= fullpage.clientHeight
        }
    };
    // scroll down effect, only when it's possible
    const scrollDown = async () => {
        if ($activeSectionStore < sectionCount-1){
            activeSection++;
            fullpage.scrollTop += fullpage.clientHeight
        }
    };
    // handling arrow event
    const handleKey = (event) => {
        if (arrows) {
            switch (event.key) {
                case 'ArrowDown':
                    scrollDown();
                    break;
                case 'ArrowUp':
                    scrollUp();
                    break;
            }
        }
    };
    // memoize drag start Y coordinate, only if drag effect is enabled
    const handleDragStart = (event) => {
        dragPosition = event.pageY - event.target.offsetTop
        dragStartScroll = fullpage.scrollTop
        dragging = true
    };
    // handles drag end event
    const handleDragging = (event) => {
        if (dragging) {
            const y = event.pageY - event.target.offsetTop
            fullpage.scrollTop = dragStartScroll - (y - dragPosition)
        }
    };
    // memoize touch start Y coordinate
    const handleDragEnd = (event) => {
        dragging = false
        const scrollDelta = fullpage.scrollTop % fullpage.clientHeight
        fullpage.scrollTop += scrollDelta > fullpage.clientHeight / 2 ? fullpage.clientHeight - scrollDelta : -scrollDelta
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
    $: activeSectionStore.set(activeSection)

    // If user has specified sectionTitles, then sections is overridden
    $: if (sectionTitles) sections = sectionTitles;

    $: generateFallbackSectionTitles(sectionTitles, sectionCount);
</script>

<svelte:window on:keydown|preventDefault={ (event)=>handleKey(event) }/> <!-- Necessity when listening to window events -->
<svelte:body class:svelte-fp-disable-pull-refresh={pullDownToRefresh}/> <!-- disables slideDownToRefresh feature -->


<div class={classes} style={style}>
    <div class="svelte-fp-container" class:dragging bind:this={fullpage} on:mousewheel|preventDefault on:mousedown|preventDefault={handleDragStart}
         on:mousemove|preventDefault={handleDragging} on:mouseup|preventDefault={handleDragEnd} on:mouseleave|preventDefault={handleDragEnd}>
        <slot />
    </div>
    <Indicator {sections} bind:activeSection/>
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
        scroll-snap-type: y mandatory;
        scroll-behavior: smooth;
        user-select: none;
    }
    .dragging {
        scroll-snap-type: y proximity;
    }
    .svelte-fp-container::-webkit-scrollbar {
        width: 0;
        background: transparent;
    }
    .svelte-fp-disable-pull-refresh {
        overscroll-behavior: contain;
    }
</style>
