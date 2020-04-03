<script>
    import {fly} from 'svelte/transition'

    let defaultClasses = '';
    export { defaultClasses as class };
    export let style = '';
    export let slideId;
    export let activeSlide;
    export let center = false;
    export let transitionIn = {
        duration: 500,
        x: -2000
    };
    export let transitionOut = {
        duration: 500,
        x: 2000
    };
    slideId = parseInt(slideId);

    const makePositive = (num) => {
        let negative = false;
        if (num < 0) {
            negative = true;
            num = -num;
        }
        return {num, negative};
    };

    $: {
        const state = makePositive(activeSlide);
        if (state.negative) {
            transitionIn.x = 2000;
            transitionOut.x = -2000;
        } else {
            transitionIn.x = -2000;
            transitionOut.x = 2000;
        }
        activeSlide = state.num;
    }
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