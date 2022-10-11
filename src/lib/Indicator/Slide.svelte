<script>
    import Dot from './Dot.svelte';

    export let slides;
    export let activeSlideIndicator;
</script>

<div class="svelte-fp-indicator-horizontal">
    <ul class="svelte-fp-indicator-list-horizontal">
        {#each slides as title, index}
            <Dot {title} {index} bind:activeDot={activeSlideIndicator} on:goto />
        {/each}
    </ul>
</div>

<style>
    .svelte-fp-indicator-horizontal {
        width: inherit;
        height: 5rem;
        overflow: hidden;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .svelte-fp-indicator-list-horizontal {
        margin: 1rem;
        padding: 1rem;
        list-style-type: none;
        display: flex;
    }
</style>
