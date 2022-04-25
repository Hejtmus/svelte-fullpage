<script>
    import {createEventDispatcher} from "svelte";

    export let slideCount;
    export let slides;
    export let activeSlideIndicator;

    const dispatch = createEventDispatcher();

    const toSlide = (index) => {
        dispatch('toSlide', index);
    }
</script>

<div class="svelte-fp-indicator-horizontal">
    <ul class="svelte-fp-indicator-list-horizontal">
        {#each Array(slideCount) as page,index}
            <li class="svelte-fp-indicator-list-item">
                <button class="svelte-fp-indicator-list-item-btn {activeSlideIndicator === index ? 'svelte-fp-active':''}" on:click={ ()=>toSlide(index) }></button>
            </li>
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
    }
    .svelte-fp-indicator-list-item {
        display: inline-block;
        margin: 1rem;
        padding: 0;
    }
    .svelte-fp-indicator-list-item-btn {
        width: 1rem;
        height: 1rem;
        border-radius: 0.5rem;
        border: solid 1px #767676;
        background-color: transparent;
    }
    .svelte-fp-active {
        background-color: #767676;
    }
</style>