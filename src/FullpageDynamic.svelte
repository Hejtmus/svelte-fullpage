<script>
    //defining variable that will hold class value, that will be passed into this component's wrapper
    let defaultClasses = '';

    //importing slide animation from svelte
    import {slide} from 'svelte/transition';

    //exporting classes, for passing classes into wrapper
    export {defaultClasses as class};
    //exporting array with components with section <FullpageSectionDynamic />
    export let sections = [];
    //exporting duration of animation and scroll cooldown
    export let animationDuration = 750;
    //exporting boolean that enables scrolling using arrows
    export let arrows = false;

    //extending exported classes with wrapper class
    let classes = `${defaultClasses} svelte-fp-wrapper`;
    //number that says, what section of array 'sections' is shown
    let activeSection = 0;
    //recent scroll represent last time that was scrolled, this prevents scrolling multiple pages at once
    let recentScroll = 0;
    //setting section visible
    let active = true;
    //defining in/out transitions
    let transitionIn = {
        duration: animationDuration,
        y: -100
    };
    let transitionOut = {
        duration: animationDuration,
        y: 100
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
            disappearDown();
            activeSection--;
            appearUp();
        }
        console.log('scroll up')
    };
    //function that makes scroll down effect
    const scrollDown = async () => {
        // TODO: somehow fix animation
        if (activeSection < sections.length-1){
            disappearUp();
            activeSection++;
            appearDown();
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
    //functions that make visible section with specific animation
    const appearUp = () => {
        transitionIn = {
            duration: animationDuration,
            y: -200
        };
        active = true;
    };
    const appearDown = () => {
        transitionIn = {
            duration: animationDuration,
            y: 200
        };
        active = true;
    };
    //functions that make invisible section with specific animation
    const disappearUp = () => {
        transitionOut = {
            duration: animationDuration,
            y: 200
        };
        active = false;
    };
    const disappearDown = () => {
        transitionOut = {
            duration: animationDuration,
            y: -200
        };
        active = false;
    };
    // TODO: mobile support, animations in-out
</script>

<svelte:window on:keydown={ (event)=>handleKey(event) }/>

<div class={classes} on:wheel={ (event)=>handleScroll(event) }>
    <div class="svelte-fp-container">
        <!-- First slide-up if active true, else slide-up -->
        {#if active}
            <svelte:component this="{sections[activeSection]}" bind:transitionIn bind:transitionOut />
        {/if}
        <div class="svelte-fp-debug">
            <button on:click={appearUp}>appearUp</button>
            <button on:click={appearDown}>appearDown</button>
            <button on:click={disappearUp}>disappearUp</button>
            <button on:click={disappearDown}>disappearDown</button>
        </div>
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
    .svelte-fp-debug {
        height: 100vh;
        overflow: hidden;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
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