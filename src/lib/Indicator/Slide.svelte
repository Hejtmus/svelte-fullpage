<script lang="ts">
    import Dot from './Dot.svelte'

    export let slides: Array<string>
    export let activeSlide: number
</script>

<div>
    <ul>
        {#each slides as title, index}
            <Dot {title} {index} activeDot={activeSlide} on:goto />
        {/each}
    </ul>
</div>

<style>
    div {
        width: 100%;
        height: auto;
        overflow: hidden;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    ul {
        margin: 1rem;
        padding: 1rem;
        list-style-type: none;
        display: flex;
    }
    @media only screen and (max-width: 600px){
        ul {
            margin: 0.3rem;
            padding: 0.3rem;
        }
    }
</style>
