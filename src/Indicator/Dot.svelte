<script>
    export let activeSection = 0;
    export let index = 0;
    export let name = '';
    export let names = false;

    const goto = () => {
        activeSection = index;
    }
</script>

<li class="svelte-fp-indicator-list-item">
    {#if names}
        <p class="svelte-fp-slide-name">
            {name}
        </p>
    {/if}
    <button class="svelte-fp-indicator-list-item-btn {activeSection === index ? 'svelte-fp-active':''}" on:click={goto}>
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
    .svelte-fp-slide-name {
        position: absolute;
        text-align: center;
        border: 1px #4e555b;
        border-radius: 3px;
        background: rgba(78, 85, 91, 0.82);
        padding: 2px;
        order: 0;
        margin: 2rem;
        justify-self: start;

    }
    .svelte-fp-indicator-list-item-btn:hover + .svelte-fp-slide-name {
    }
    @media only screen and (max-width: 600px){
        .svelte-fp-indicator-list-item-btn {
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 0.25rem;
        }
    }
</style>