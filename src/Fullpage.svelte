<script>
    import Indicator from './Indicator/index.svelte';
    import {onMount, setContext} from "svelte";
    import {writable} from "svelte/store";
    //defining variable that will hold class value, that will be passed into this component's wrapper
    let defaultClasses = '';

    //importing slide animation from svelte
    //import {slide} from 'svelte/transition';

    //exporting classes, for passing classes into wrapper
    export {defaultClasses as class};
    export let style = '';
    //number that hold which section is active
    export let activeSection = 0;
    const activeSectionStore = writable(activeSection)
    let sectionCount = 0;
    //array with names of section, the most important about this array is that it's hold fullpage's length TODO: make relevant
    export let sectionTitles = false;
    let sections = [];
    //exporting duration of animation and scroll cooldown
    export let transitionDuration = 500;
    //exporting boolean that enables scrolling using arrows
    export let arrows = false;
    //exporting boolean that enables scrolling using drag
    export let drag = false;
    export let dragThreshold = 100;
    export let touchThreshold = 75;
    export let pullDownToRefresh = false;

    let fullpageContent;

    let dragStartPosition;
    let touchStartPosition;

    //extending exported classes with wrapper class
    let classes = `${defaultClasses} svelte-fp-wrapper`;
    let recentScroll = 0;
    //setting section visible
    let active = true;

    // Passing data about section visibility to all sections
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
    //function that toggles visibility of active section
    const toggleActive = () => {
        active = !active;
    };
    //function that makes scroll up effect
    const scrollUp = async () => {
        // TODO: somehow fix animation
        if (activeSection > 0){
            activeSection--;
        }
    };
    //function that makes scroll down effect
    const scrollDown = async () => {
        // TODO: somehow fix animation
        if (activeSection < sectionCount){
            activeSection++;
        }
    };
    //function that handles arrow event
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
    //function that handles drag start event
    const handleDragStart = (event) => {
        if (drag) {
            dragStartPosition = event.screenY;
        }
        //event.preventDefault();
    };
    //function that handles drag end event
    const handleDragEnd = (event) => {
        if (drag) {
            const dragEndPosition = event.screenY;
            //console.log(`Start:${dragStartPosition}, End:${dragEndPosition}, vertical difference:${dragStartPosition-dragEndPosition}`);
            if (dragStartPosition - dragEndPosition > dragThreshold) {
                scrollDown();
            } else if (dragStartPosition - dragEndPosition < -dragThreshold) {
                scrollUp()
            }
        }
        //event.preventDefault();
    };
    //function that handles touch event
    const handleTouchStart = (event) => {
        //event.preventDefault();
        touchStartPosition = event.touches[0].screenY;
    };
    const handleTouchEnd = (event) => {
        //event.preventDefault();
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

    $: if (sectionTitles) sections = sectionTitles;

    $: if (fullpageContent && !sectionTitles) {
        console.log(fullpageContent.children.length)
        for (let i = 0; sectionCount > i; i++) {
            sections = [
                ...sections,
                `Section ${i+1}`
            ];
        }
        console.log(sections)
    }
</script>

<svelte:window on:keydown={ (event)=>handleKey(event) }/>
<svelte:body class:svelte-fp-disable-pull-refresh={pullDownToRefresh}/>


<div class={classes} style={style} on:wheel={ (event)=>handleScroll(event) } on:touchstart={ (event)=>handleTouchStart(event) } on:touchmove={ (event)=>handleTouchEnd(event) }
        on:drag={ ()=>{return false} } on:mousedown={ (event)=>handleDragStart(event) } on:mouseup={ (event)=>handleDragEnd(event) }>
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