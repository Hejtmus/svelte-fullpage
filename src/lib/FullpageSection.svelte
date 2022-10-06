<script>
    import Indicator from './Indicator/Slide.svelte';
    import {getContext, onMount, setContext} from "svelte";
    import { writable } from "svelte/store";

    let defaultClasses = '';

    export { defaultClasses as class };
    export let style = '';
    let sectionId;
    const { getId, activeSectionStore} = getContext('section');
    export let slideTitles = false;
    let slides = [];
    export let activeSlide = 0;
    const activeSlideStore = writable(activeSlide);
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

    let activeSlideIndicator = activeSlide;
    let dragStartPosition;
    let touchStartPosition;
    let recentSlide = 0;
    let slideCount = 0;

    let classes = `${defaultClasses} svelte-fp-section svelte-fp-flexbox-center`;

    if (!select) {
        classes = `${classes} svelte-fp-unselectable`
    }

    // Passing data about slide visibility to all slides, same principle as setContext('section',{...}) in Fullpage.svelte
    setContext('slide', {
        activeSlideStore,
        getId: ()=>{
            slideCount++;
            return slideCount-1;
        }
    })

    const makePositive = (num) => {
        let negative = false;
        if (num < 0) {
            negative = true;
            num = -num;
        }
        return {num, negative};
    };

    const handleSelect = () => {
        if (!select) {
            return false;
        }
    };

    const slideRight = () => {
        const active = makePositive($activeSlideStore);
        if (active.num < slides.length-1){
            activeSlideIndicator = active.num+1;
            activeSlideStore.set(-(activeSlideIndicator));
        } else {
            activeSlideStore.set(0)
            activeSlideIndicator = $activeSlideStore;
        }
    };

    const slideLeft = () => {
        const active = makePositive($activeSlideStore);
        if (active.num > 0) {
            activeSlideStore.set(active.num-1);
        } else {
            activeSlideStore.set(slides.length-1);
        }
        activeSlideIndicator = $activeSlideStore;
    };

    const toSlide = (slideId) => {
        if (slideId > activeSlideIndicator) {
            while (slideId > activeSlideIndicator) {
                slideRight()
            }
        } else {
            while (slideId < activeSlideIndicator) {
                slideLeft()
            }
        }
    };

    // handling arrow event
    const handleKey = (event) => {
        if (arrows) {
            switch (event.key) {
                case 'ArrowLeft':
                    slideLeft();
                    break;
                case 'ArrowRight':
                    slideRight();
                    break;
            }
        }
    };

    // memoize drag start X coordinate
    const handleDragStart = (event) => {
        dragStartPosition = event.screenX;
    };
    // handles drag end event
    const handleDragEnd = (event) => {
        const dragEndPosition = event.screenX;
        // Trigger scroll event after thresholds are exceeded
        if (dragStartPosition - dragEndPosition > dragThreshold) {
            slideRight();
        } else if (dragStartPosition - dragEndPosition < -dragThreshold) {
            slideLeft()
        }
    };

    // memoize touch start X coordinate
    const handleTouchStart = (event) => {
        touchStartPosition = event.touches[0].screenX;
    };
    // Compare touch start and end X coordinates, if difference exceeds threshold, scroll function is triggered
    const handleTouchEnd = (event) => {
        // Timer is used for preventing scrolling multiple slides
        let timer = new Date().getTime();
        const touchEndPosition = event.touches[0].screenX;
        if (transitionDuration < timer-recentSlide) {
            if (touchStartPosition - touchEndPosition > touchThreshold) {
                slideRight();
                recentSlide = timer;
            } else if (touchStartPosition - touchEndPosition < -touchThreshold) {
                slideLeft();
                recentSlide = timer;
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
        slideCount = 0;
    }

    // If user has specified slideTitles, then slides is overridden
    $: if (slideTitles) slides = slideTitles;

    $: generateFallbackSlideTitles(slideTitles, slideCount);
</script>

<!--<svelte:window on:keydown={ (event)=>handleKey(event) }/>-->

<section class={classes} style={style} class:slidable={slideCount !== 0}>
    <div class="svelte-fp-container svelte-fp-flexbox-expand" class:svelte-fp-flexbox-center={center}>
        <slot>
        </slot>
    </div>
    {#if slideCount > 0}
        <Indicator {slides} {activeSlideIndicator} on:toSlide={(e)=>toSlide(e.detail)}/>
    {/if}
</section>

<style>
    section {
        height: inherit;
        position: relative;
        scroll-snap-align: center;
        scroll-snap-stop: always;
    }
    .slidable {
        overflow-x: scroll;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
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
