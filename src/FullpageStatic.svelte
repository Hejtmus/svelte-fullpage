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
    let transition = {
        duration: animationDuration
    };

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
    const scrollUp = () => {
        if (activePage > 0){
            activePage--;
        }
        console.log('scroll up')
    };
    const scrollDown = () => {
        if (activePage < pages.length-1){
            toggleActive();
            activePage++;
            toggleActive();
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
    // TODO: mobile support, animations in-out, side indicator
</script>

<svelte:window on:keydown={ (event)=>handleKey(event) }/>

<div class={classes} on:wheel={ (event)=>handleScroll(event) }>
    <slot />
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
</style>