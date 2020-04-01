<script>
    import {slide} from 'svelte/transition';

    //<FullpageSectionStatic bind:activeSection sectionId="id"></FullpageSectionStatic>

    let defaultClasses = '';

    export { defaultClasses as class };
    export let sectionId;
    export let activeSection;
    export let slides = [];
    export let activeSlide = false;
    export let center = false;
    export let arrows = false;
    export let select = false;
    export let transitionDuration = 500;
    export let transition = {
        duration: transitionDuration
    };
    sectionId = parseInt(sectionId);

    let dragStartPosition;
    let touchStartPosition;
    let recentSlide = 0;

    let classes = `${defaultClasses} svelte-fp-section svelte-fp-flexbox-center`;

    if (!select) {
        classes = `${classes} svelte-fp-unselectable`
    }

    const handleSelect = () => {
        if (!select) {
            return false;
        }
    };

    const slideRight = () => {
        if (activeSlide < slides.length-1){
            activeSlide++;
        } else {
            activeSlide = 0;
        }
    };

    const slideLeft = () => {
        if (activeSlide > 0) {
            activeSlide--;
        } else {
            activeSlide = slides.length-1;
        }
    };

    //function that handles arrow event
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

    //function that handles drag start event
    const handleDragStart = (event) => {
        dragStartPosition = event.screenX;
    };
    //function that handles drag end event
    const handleDragEnd = (event) => {
        const dragEndPosition = event.screenX;
        if (dragStartPosition - dragEndPosition > 100) {
            slideRight();
        } else if (dragStartPosition - dragEndPosition < -100) {
            slideLeft()
        }
    };
    //function that handles touch event
    const handleTouchStart = (event) => {
        //event.preventDefault();
        console.log(event.touches);
        touchStartPosition = event.touches[0].screenX;
        console.log(touchStartPosition)
    };
    const handleTouchEnd = (event) => {
        //event.preventDefault();
        console.log(event);
        let timer = new Date().getTime();
        const touchEndPosition = event.touches[0].screenX;
        if (transitionDuration < timer-recentSlide) {
            if (touchStartPosition - touchEndPosition > 100) {
                slideRight();
                recentSlide = timer;
            } else if (touchStartPosition - touchEndPosition < -100) {
                slideLeft();
                recentSlide = timer;
            }
        }
    };


</script>

<svelte:window on:keydown={ (event)=>handleKey(event) }/>

{#if sectionId === activeSection}
    <section transition:slide={transition} class={classes} on:selectstart={handleSelect}
             on:mousedown={ (event)=>handleDragStart(event) } on:mouseup={ (event)=>handleDragEnd(event) }>
        <div class="svelte-fp-container svelte-fp-flexbox-expand" class:svelte-fp-flexbox-center={center}>
            <slot>
            </slot>
        </div>
        {#if slides[0]}
            <div class="svelte-fp-indicator-horizontal">
                <ul class="svelte-fp-indicator-list-horizontal">
                    {#each slides as page,index}
                        <li class="svelte-fp-indicator-list-item">
                            <button class="svelte-fp-indicator-list-item-btn {activeSlide === index ? 'svelte-fp-active':''}" on:click={ ()=>activeSlide=index }></button>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </section>
{/if}

<style>
    section {
        height: inherit;
        position: relative;
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
    .svelte-fp-unselectable {
        user-select: none;
    }
    .svelte-fp-indicator-horizontal {
        width: inherit;
        height: 5rem;
        overflow: hidden;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .svelte-fp-indicator-list-horizontal {
        margin: 1rem;
        padding: 1rem;
        list-style-type: none;
    }
    .svelte-fp-indicator-list-item {
        display: inline-block;
        margin: 1rem;
        padding: 0;
    }
    .svelte-fp-indicator-list-item-btn {
        width: 1rem;
        height: 1rem;
        border-radius: 0.5rem;
        border: solid 1px #767676;
        background-color: transparent;
    }
    .svelte-fp-active {
        background-color: #767676;
    }
</style>