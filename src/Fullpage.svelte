<script>
    let defaultClasses = '';

    export {defaultClasses as class};
    export let pages = [];
    export let animationDuration = 750;
    export let arrows = false;

    let classes = `${defaultClasses} svelte-fp-wrapper`;
    let activePage = 0;
    let recentScroll = 0;

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
    const scrollUp = () => {
        if (activePage > 0){
            activePage--;
        }
        console.log('scroll up')
    };
    const scrollDown = () => {
        if (activePage < pages.length-1){
            activePage++;
        }
        console.log('scroll down')
    };
    const handleKey = (event) => {
        if (arrows) {
            console.log(event);
            switch (event.key) {
                case 38:
                    scrollDown();
                    break;
                case 40:
                    scrollUp();
                    break;
                default:
                    console.log(event.key);
                    break;
            }
        }
    };
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

<svelte:window on:keypress={ (event)=>handleKey(event) }/>

<div class={classes} on:wheel={ (event)=>handleScroll(event) }>
    <svelte:component this="{pages[activePage]}" {animationDuration} />
</div>

<style>
    .svelte-fp-wrapper {
        height: 100vh;
        overflow: hidden;
    }
</style>