<script>
    //defining variable that will hold class value, that will be passed into this component's wrapper
    let defaultClasses = '';

    //importing slide animation from svelte
    //import {slide} from 'svelte/transition';

    //exporting classes, for passing classes into wrapper
    export {defaultClasses as class};
    //number that hold which section is active
    export let activeSection = 0;
    //array with names of section, the most important about this array is that it's hold fullpage's length
    export let sections = [];
    //exporting duration of animation and scroll cooldown
    export let animationDuration = 750;
    //exporting boolean that enables scrolling using arrows
    export let arrows = false;

    //extending exported classes with wrapper class
    let classes = `${defaultClasses} svelte-fp-wrapper`;
    let recentScroll = 0;
    //setting section visible
    let active = true;
    //defining transition
    let transition = {
        duration: animationDuration
    };

    //function that handles scroll and sets scroll cooldown based on animation duration
    const handleScroll = (event) => {
        //getting direction of scroll, if negative, scroll up, if positive, scroll down
        let deltaY = event.deltaY;
        let timer = new Date().getTime();
        //if cooldown time is up, fullpage is scrollable again
        if (animationDuration < timer-recentScroll) {
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
        console.log('scroll up')
    };
    //function that makes scroll down effect
    const scrollDown = async () => {
        // TODO: somehow fix animation
        if (activeSection < sections.length-1){
            activeSection++;
        }
        console.log('scroll down')
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
    // TODO: mobile support, animations in-out
</script>

<svelte:window on:keydown={ (event)=>handleKey(event) }/>

<div class={classes} on:wheel={ (event)=>handleScroll(event) }>
    <div class="svelte-fp-container">
        <!-- First slide-up if active true, else slide-up -->
        {#if active}
            <slot />
        {/if}
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