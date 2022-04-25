<script>
    import { createEventDispatcher } from "svelte";

    export let activeDot = 0;
    export let index = 0;
    export let title = '';

    const dispatch = createEventDispatcher();

    const click = () => {
        dispatch('click', index)
    }
</script>

<li class="svelte-fp-indicator-list-item">
    <button title={title || ''} class="svelte-fp-indicator-list-item-btn {activeDot === index ? 'svelte-fp-active':''}"
            on:click={click}>
    </button>
</li>

<style>
    .svelte-fp-indicator-list-item {
        margin: 1rem;
        padding: 0;
        display: flex;
        align-items: center;
    }
    .svelte-fp-indicator-list-item-btn {
        width: 1rem;
        height: 1rem;
        border-radius: 0.5rem;
        border: solid 1px #767676;
        background-color: transparent;
        order: 1;
        align-self: end;
    }
    .svelte-fp-active {
        background-color: #767676;
    }

    @media only screen and (max-width: 600px){
        .svelte-fp-indicator-list-item-btn {
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 0.25rem;
        }
    }
</style>