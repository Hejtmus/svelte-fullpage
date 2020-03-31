<script>
    let defaultClasses = '';

    import {slide} from 'svelte/transition';

    export {defaultClasses as class};
    export let pages = [];
    export let animationDuration = 750;
    export let arrows = false;

    let classes = `${defaultClasses} svelte-fp-wrapper`;
    let activePage = 0;
    let recentScroll = 0;
    let active = true;
    let transitionIn = {
        duration: animationDuration,
        y: -100
    };
    let transitionOut = {
        duration: animationDuration,
        y: 100
    };
    //let transition;

    const handleScroll = (event) => {
        let deltaY = event.deltaY;
        let timer = new Date().getTime();
        //event.preventDefault();
        console.log(`${animationDuration} < ${timer} - ${recentScroll}`);
        if (animationDuration < timer-recentScroll) {
            recentScroll = timer;
            if (deltaY < 0) {
                scrollUp()
            } else if (deltaY > 0) {
                scrollDown()
            }
        }
    };
    const toggleActive = () => {
      active = !active;
    };
    const scrollUp = async () => {
        if (activePage > 0){
            disappearDown();
            activePage--;
            appearUp();
        }
        console.log('scroll up')
    };
    const scrollDown = async () => {
        if (activePage < pages.length-1){
            disappearUp();
            activePage++;
            appearDown();
        }
        console.log('scroll down')
    };
    const handleKey = (event) => {
        if (arrows) {
            console.log(event);
            switch (event.key) {
                case 'ArrowDown':
                    scrollDown();
                    break;
                case 'ArrowUp':
                    scrollUp();
                    break;
                default:
                    console.log(event.key);
                    break;
            }
        }
    };
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
    // TODO: mobile support, animations in-out, side indicator
</script>

<!--div class={classes} bind:scrollY={scroll} on:wheel={ (event)=>handleScroll(event) } on:keypress={ (event)=>handleKey(event) }>
    <slot>
    </slot>
</div-->

<!--div class={classes} on:wheel={ (event)=>handleScroll(event) } on:keypress={ (event)=>handleKey(event) }>
    {#each pages as item}
        <svelte:component this="{item}" />
    {/each}
</div-->

<svelte:window on:keydown={ (event)=>handleKey(event) }/>

<div class={classes} on:wheel={ (event)=>handleScroll(event) }>
    <div class="svelte-fp-container">
        <!-- First slide-up if active true, else slide-up -->
        {#if active}
            <svelte:component this="{pages[activePage]}" bind:transitionIn bind:transitionOut />
        {/if}
        <div class="svelte-fp-debug">
            <button on:click={appearUp}>appearUp</button>
            <button on:click={appearDown}>appearDown</button>
            <button on:click={disappearUp}>disappearUp</button>
            <button on:click={disappearDown}>disappearDown</button>
        </div>
        <div class="svelte-fp-indicator">
            <ul class="svelte-fp-indicator-list">
                {#each pages as page,index}
                    <li class="svelte-fp-indicator-list-item">
                        <button class="svelte-fp-indicator-list-item-btn {activePage === index ? 'svelte-fp-active':''}" on:click={ ()=>activePage=index }></button>
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
        top: 0;
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