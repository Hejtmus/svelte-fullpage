<script lang="ts">
    import Dot from './Dot.svelte'

    export let sections: Array<string>
    export let activeSection: number
</script>

<div>
    <ul>
        {#each sections as title, index}
            <Dot {title} {index} bind:activeDot={activeSection} on:goto />
        {/each}
    </ul>
</div>

<style>
    div {
        height: 100%;
        width: auto;
        overflow: hidden;
        position: absolute;
        z-index: 100;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    ul {
        margin: 1rem;
        padding: 1rem;
        list-style-type: none;
    }
    @media only screen and (max-width: 600px){
        ul {
            margin: 0.3rem;
            padding: 0.3rem;
        }
    }
</style>
