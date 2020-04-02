<script>
    //defining variable that will hold class value, that will be passed into this component's wrapper
    let defaultClasses = '';

    //importing slide animation from svelte
    //import {slide} from 'svelte/transition';

    //exporting classes, for passing classes into wrapper
    export {defaultClasses as class};
    export let style = '';
    //number that hold which section is active
    export let activeSection = 0;
    //array with names of section, the most important about this array is that it's hold fullpage's length
    export let sections = [];
    //exporting duration of animation and scroll cooldown
    export let transitionDuration = 500;
    //exporting boolean that enables scrolling using arrows
    export let arrows = false;
    //exporting boolean that enables scrolling using drag
    export let drag = false;

    let dragStartPosition;
    let touchStartPosition;

    //extending exported classes with wrapper class
    let classes = `${defaultClasses} svelte-fp-wrapper`;
    let recentScroll = 0;
    //setting section visible
    let active = true;

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
        if (activeSection < sections.length-1){
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
            if (dragStartPosition - dragEndPosition > 100) {
                scrollDown();
            } else if (dragStartPosition - dragEndPosition < -100) {
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
            if (touchStartPosition - touchEndPosition > 100) {
                scrollDown();
                recentScroll = timer;
            } else if (touchStartPosition - touchEndPosition < -100) {
                scrollUp();
                recentScroll = timer;
            }
        }
    };
    // TODO: slide
</script>

<svelte:window on:keydown={ (event)=>handleKey(event) }/>


<div class={classes} style={style} on:wheel={ (event)=>handleScroll(event) } on:touchstart={ (event)=>handleTouchStart(event) } on:touchmove={ (event)=>handleTouchEnd(event) }
        on:drag={ ()=>{return false} } on:mousedown={ (event)=>handleDragStart(event) } on:mouseup={ (event)=>handleDragEnd(event) }>
    <div class="svelte-fp-container">
        <slot />
        <div class="svelte-fp-indicator">
            <ul class="svelte-fp-indicator-list">
                {#each sections as page,index}
                    <li class="svelte-fp-indicator-list-item">
                        <button class="svelte-fp-indicator-list-item-btn {activeSection === index ? 'svelte-fp-active':''}" on:click={ ()=>activeSection=index }></button>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
</div>

<style>
    .svelte-fp-wrapper {
        height: 100vh;
        overflow: hidden;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
    .svelte-fp-container {
        height: inherit;
        width: inherit;
        position: relative;
    }
    .svelte-fp-indicator {
        height: inherit;
        width: 5rem;
        overflow: hidden;
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .svelte-fp-indicator-list {
        margin: 1rem;
        padding: 1rem;
        list-style-type: none;
    }
    .svelte-fp-indicator-list-item {
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
    @media only screen and (max-width: 600px){
        .svelte-fp-indicator {
            display: none;
        }
    }
</style>