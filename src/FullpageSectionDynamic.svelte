<script>
    import {slide} from 'svelte/transition';

    let defaultClasses = '';

    export { defaultClasses as class };
    export let center = false;
    export let transitionIn ={
        duration: 750,
    };
    export let transitionOut ={
        duration: 750
    };
    //export let name = '';


    let classes = `${defaultClasses} svelte-fp-section`;

    if (center) {
        classes = `${classes} svelte-fp-flexbox-center`
    }
</script>

<section in:slide={transitionIn} out:slide={transitionOut} class={classes}>
    <slot>
    </slot>
</section>

<style>
    section {
        height: inherit;
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