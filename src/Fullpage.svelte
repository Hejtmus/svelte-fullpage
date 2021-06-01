<script>
    import Indicator from './Indicator/index.svelte';
    import {onMount, setContext} from "svelte";
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
    // Optional array of strings containing section titles, also count of section is calculated by length of this array
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

    // Placeholder for content of slot
    let fullpageContent;

    // Auxiliary variables that make possible drag and scroll feature
    let dragStartPosition;
    let touchStartPosition;

    //extending exported classes with wrapper class
    let classes = `${defaultClasses} svelte-fp-wrapper`;
    let recentScroll = 0;
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
    // toggles visibility of active section
    const toggleActive = () => {
        active = !active;
    };
    // scroll up effect, only when it's possible
    const scrollUp = async () => {
        if ($activeSectionStore > 0){
            activeSection--;
        }
    };
    // scroll down effect, only when it's possible
    const scrollDown = async () => {
        if ($activeSectionStore < sectionCount-1){
            activeSection++;
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
        if (drag) {
            dragStartPosition = event.screenY;
        }
    };
    // handles drag end event
    const handleDragEnd = (event) => {
        if (drag) {
            const dragEndPosition = event.screenY;
            // Trigger scroll event after thresholds are exceeded
            if (dragStartPosition - dragEndPosition > dragThreshold) {
                scrollDown();
            } else if (dragStartPosition - dragEndPosition < -dragThreshold) {
                scrollUp()
            }
        }
    };
    // memoize touch start Y coordinate
    const handleTouchStart = (event) => {
        touchStartPosition = event.touches[0].screenY;
    };
    // Compare touch start and end Y coordinates, if difference exceeds threshold, scroll function is triggered
    const handleTouchEnd = (event) => {
        let timer = new Date().getTime();
        const touchEndPosition = event.touches[0].screenY;
        if (transitionDuration < timer-recentScroll) {
            if (touchStartPosition - touchEndPosition > touchThreshold) {
                scrollDown();
                recentScroll = timer;
            } else if (touchStartPosition - touchEndPosition < -touchThreshold) {
                scrollUp();
                recentScroll = timer;
            }
        }
    };


    // Everytime active session updates, also this store gets new value and then all sections that subscribe
    $: activeSectionStore.set(activeSection)

    // If user has specified sectionTitles, then sections is overridden
    $: if (sectionTitles) sections = sectionTitles;

    // If user hasn't specified sectionTitle, sections array will be generated with placeholder strings
    $: if (fullpageContent && !sectionTitles) {
        console.log(fullpageContent.children.length)
        for (let i = 0; sectionCount > i; i++) {
            sections = [
                ...sections,
                `Section ${i+1}`
            ];
        }
    }
</script>

<svelte:window on:keydown={ (event)=>handleKey(event) }/> <!-- Necessity when listening to window events -->
<svelte:body class:svelte-fp-disable-pull-refresh={pullDownToRefresh}/> <!-- disables slideDownToRefresh feature -->


<div class={classes} style={style} on:wheel={ (event)=>handleScroll(event) } on:touchstart={ (event)=>handleTouchStart(event) }
     on:touchmove={ (event)=>handleTouchEnd(event) } on:drag={ ()=>{return false} }
     on:mousedown={ (event)=>handleDragStart(event) } on:mouseup={ (event)=>handleDragEnd(event) }>
    <div class="svelte-fp-container">
        <div bind:this={fullpageContent} class="svelte-fp-container">
            <slot />
        </div>
        <Indicator bind:activeSection bind:sections/>
    </div>
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
        overflow: hidden;
    }
    .svelte-fp-container {
        height: inherit;
        width: inherit;
        position: relative;
    }
    .svelte-fp-disable-pull-refresh {
        overscroll-behavior: contain;
    }
</style>