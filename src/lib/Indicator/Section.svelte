<script>
    import Dot from './Dot.svelte';

    export let sections;
    export let activeSection = 0;

    const toSection = (event) => {
        activeSection = event.detail;
    }
</script>

<div class="svelte-fp-indicator">
    <ul class="svelte-fp-indicator-list">
        {#each sections as title, index}
            <Dot {title} {index} bind:activeDot={activeSection} on:click={toSection}/>
        {/each}
    </ul>
</div>

<style>
    .svelte-fp-indicator {
        height: inherit;
        width: auto;
        overflow: hidden;
        position: fixed;
        z-index: 100;
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
    @media only screen and (max-width: 600px){
        .svelte-fp-indicator {
            width: 2rem;
        }
        .svelte-fp-indicator-list {
            margin: 0.3rem;
            padding: 0.3rem;
        }
    }
</style>
