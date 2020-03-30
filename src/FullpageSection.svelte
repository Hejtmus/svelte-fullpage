<script>
    import {slide} from 'svelte/transition';

    let defaultClasses = '';

    export { defaultClasses as class };
    export let center = false;
    export let animationDuration = 750;
    //export let name = '';


    let classes = `${defaultClasses} svelte-fp-section`;

    if (center) {
        classes = `${classes} svelte-fp-flexbox-center`
    }
</script>

<section transition:slide={{duration:animationDuration}} class={classes}>
    <slot>
    </slot>
</section>

<style>
    section {
        height: 100vh;
        position: relative;
    }
    slot {
        position: absolute;
    }
    .svelte-fp-flexbox-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>