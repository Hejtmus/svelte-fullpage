<script lang="ts">
    import Indicator from './Indicator/Slide.svelte';
    import {getContext, onMount, setContext} from "svelte";
    import { FullpageActivity } from './stores'
    import { writable } from 'svelte/store'

    let defaultClasses = '';

    export { defaultClasses as class };
    export let style = '';
    let sectionId;
    const { getId, activeSectionStore} = getContext('section');
    export let slideTitles: Array<string> | false = false;
    let slides = [];
    export let activeSlide = 0;
    export let center = false;
    export let arrows = false;
    export let select = false;
    export let transitionDuration = 500;
    export let dragThreshold = 100;
    export let touchThreshold = 75;
    export let transition = {
        duration: transitionDuration
    };
    sectionId = parseInt(sectionId);
    let visible;

    let touchStartPosition;
    let recentSlide = 0;
    const slideCount = writable(0);
    const activeSlideStore = FullpageActivity(slideCount);
    let section
    let dragPosition
    let dragStartScroll
    let dragging

    let classes = `${defaultClasses} svelte-fp-section svelte-fp-flexbox-center`;

    if (!select) {
        classes = `${classes} svelte-fp-unselectable`
    }

    // Passing data about slide visibility to all slides, same principle as setContext('section',{...}) in Fullpage.svelte
    setContext('slide', {
        activeSlideStore,
        getId: ()=>{
            $slideCount++;
            return $slideCount - 1;
        }
    })

    const slideRight = () => {
        activeSlideStore.nextPage()
        updateSlideScroll($activeSlideStore)
    };

    const slideLeft = () => {
        activeSlideStore.previousPage()
        updateSlideScroll($activeSlideStore)
    };

    const toSlide = (event) => {
        const slideId = event.detail
        activeSlideStore.toPage(slideId)
        updateSlideScroll($activeSlideStore)
    };
    const updateSlideScroll = (activeSlide) => {
        if (section) {
            section.scrollTo({
                left: activeSlide * section.clientWidth
            })
        }
    }

    // handling arrow event
    const handleKey = (event) => {
        if (arrows) {
            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault()
                    slideLeft();
                    break;
                case 'ArrowRight':
                    event.preventDefault()
                    slideRight();
                    break;
            }
        }
    };

    const handleDragStart = (event) => {
        dragPosition = event.clientX
        dragStartScroll = section.scrollLeft
        dragging = true
    };
    const handleDragging = (event) => {
        if (dragging) {
            section.scrollTo({
                left: dragStartScroll - (event.clientX - dragPosition)
            })
        }
    };
    const handleDragEnd = () => {
        dragging = false
        const hasScrolledLeft = dragStartScroll > section.scrollLeft
        const scrollDelta = section.scrollLeft % section.clientWidth
        const hasExceededScrollRoundThreshold = Math.abs(scrollDelta) > section.clientWidth / 4
        if (hasExceededScrollRoundThreshold) {
            hasScrolledLeft ? slideLeft() : slideRight()
        }
    };

    // memoize touch start X coordinate
    const handleTouchStart = (event) => {
        touchStartPosition = event.touches[0].screenX;
    };
    // Compare touch start and end X coordinates, if difference exceeds threshold, scroll function is triggered
    const handleTouchMove = (event) => {
        // Timer is used for preventing scrolling multiple slides
        const now = Date.now()
        const touchEndPosition = event.touches[0].screenX;
        if (transitionDuration < now - recentSlide) {
            const touchDelta = touchStartPosition - touchEndPosition
            const hasScrolledLeft = touchStartPosition < touchEndPosition
            if (Math.abs(touchDelta) > touchThreshold) {
                hasScrolledLeft ? slideLeft() : slideRight()
                recentSlide = now
            }
        }
    };
    // If user hasn't specified slideTitle, sections array will be generated with placeholder strings
    const generateFallbackSlideTitles = (slideTitles, slideCount) => {
        if (slideCount !== 0 && !slideTitles) {
            slides = [];
            for (let i = 0; slideCount > i; i++) {
                slides = [
                    ...slides,
                    `Slide ${i+1}`
                ];
            }
        }
    }


    // Recompute visible: boolean everytime one of dependencies change
    $: visible = (sectionId === $activeSectionStore);

    /*
    Everytime activeSlide updates, this store gets new value and then all slides that subscribe,
    this is because user may want to control slides programmatically
     */
    $: activeSlideStore.set(activeSlide)

    // After DOM is ready ged sectionId
    onMount(()=>{
        sectionId = getId()
    })
    // Everytime section disappears, slide count resets, this prevents slides from getting wrong ID
    $: if (!visible) {
        $slideCount = 0;
    }

    // If user has specified slideTitles, then slides is overridden
    $: if (slideTitles) slides = slideTitles;

    $: generateFallbackSlideTitles(slideTitles, $slideCount);
    $: updateSlideScroll($activeSlideStore)
</script>

<svelte:window on:keydown={ (event)=>handleKey(event) }/>

<section class={classes} style={style}>
    <div class="svelte-fp-container svelte-fp-flexbox-expand" class:slidable={$slideCount !== 0} class:svelte-fp-flexbox-center={center}
         bind:this={section}
         on:mousewheel|preventDefault on:mousedown={handleDragStart} on:mousemove|preventDefault={handleDragging}
         on:mouseup={handleDragEnd} on:mouseleave={handleDragEnd} on:touchstart|preventDefault={handleTouchStart}
         on:touchmove|preventDefault={handleTouchMove}>
        <slot />
    </div>
    {#if $slideCount > 0}
        <Indicator {slides} activeSlideIndicator={$activeSlideStore} on:goto={toSlide}/>
    {/if}
</section>

<style>
    section {
        height: inherit;
        width: inherit;
        position: relative;
        scroll-snap-align: center;
        scroll-snap-stop: always;
    }
    .slidable {
        overflow-x: scroll;
        scroll-behavior: smooth;
        user-select: none;
        display: flex;
        flex-direction: row;
    }
    .slidable::-webkit-scrollbar {
        width: 0;
        background: transparent;
    }
    .svelte-fp-flexbox-expand {
        flex: 1;
    }
    .svelte-fp-container {
        height: inherit;
        width: inherit;
        position: relative;
    }
    .svelte-fp-flexbox-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
