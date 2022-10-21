<script lang="ts">
    import { createEventDispatcher } from 'svelte'

    export let activeDot = 0
    export let index = 0
    export let title = ''

    const dispatch = createEventDispatcher()

    const goto = () => {
        dispatch('goto', index)
    }
</script>

<li>
    <button title={title || ''} on:click={goto}>
        <i class:svelte-fp-active-dot={activeDot === index}></i>
    </button>
</li>

<style>
    li {
        margin: 1rem;
        padding: 0;
        width: 1rem;
        height: 1rem;
    }
    button {
        height: 100%;
        width: 100%;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
    }
    i {
        width: 40%;
        height: 40%;
        transition: width 1s, height 1s;
        border-radius: 50%;
        background-color: #767676;
    }
    .svelte-fp-active-dot {
        width: 100%;
        height: 100%;
    }

    @media only screen and (max-width: 600px){
        li {
            margin: 0.5rem;
        }
    }
</style>
