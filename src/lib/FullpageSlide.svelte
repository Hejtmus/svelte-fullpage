<script>
    import {fly} from 'svelte/transition'
    import {getContext, onMount} from "svelte";

    let defaultClasses = '';
    export { defaultClasses as class };
    export let style = '';
    let slideId = 0;
    let activeSlide = 0;
    const { activeSlideStore, getId } = getContext('slide')
    export let center = false;
    export let transitionIn = {
        duration: 500,
        x: -2000
    };
    export let transitionOut = {
        duration: 500,
        x: 2000
    };

    const makePositive = (num) => {
        let negative = false;
        if (num < 0) {
            negative = true;
            num = -num;
        }
        return {num, negative};
    };

    const correctAnimation = (active) => {
        const state = makePositive(active);
        // Sets animation direction based on scroll/drag/arrow direction
        if (state.negative) {
            transitionIn.x = 2000;
            transitionOut.x = -2000;
        } else {
            transitionIn.x = -2000;
            transitionOut.x = 2000;
        }
        activeSlide = state.num;
    }

    // When activeSlide value changes, activeSlideStore value updates
    $: activeSlideStore.set(activeSlide)

    // When activeSlideStore value changes, recompute transitions and change activeSlide
    $: correctAnimation($activeSlideStore)

    // After DOM is ready ged slideId
    onMount(()=>{
        slideId = getId()
    })
</script>

{#if slideId === activeSlide}
    <div class={`${defaultClasses} svelte-fp-content`} style={style} in:fly={transitionIn} out:fly={transitionOut} class:svelte-fp-flexbox-center={center}>
        <slot>
        </slot>
    </div>
{/if}

<style>
    .svelte-fp-content {
        height: inherit;
        width: inherit;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
    .svelte-fp-flexbox-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>