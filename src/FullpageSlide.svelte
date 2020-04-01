<script>
    import {fly} from 'svelte/transition'

    export let slideId;
    export let activeSlide;
    export let center = false;
    export let transitionIn = {
        duration: 250,
        x: -200
    };
    export let transitionOut = {
        duration: 250,
        x: 200
    };
    slideId = parseInt(slideId);

</script>

{#if slideId === activeSlide}
    <div class="svelte-fp-content" in:fly={transitionIn} out:fly={transitionOut} class:svelte-fp-flexbox-center={center}>
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