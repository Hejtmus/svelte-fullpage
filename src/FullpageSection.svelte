<script>
    import {slide} from 'svelte/transition';

    //<FullpageSectionStatic bind:activeSection sectionId="id"></FullpageSectionStatic>

    let defaultClasses = '';

    export { defaultClasses as class };
    export let sectionId;
    export let activeSection;
    export let slides = [];
    export let activeSlide = false;
    export let center = false;
    export let select = false;
    export let transition = {
        duration: 750
    };
    sectionId = parseInt(sectionId);

    let classes = `${defaultClasses} svelte-fp-section svelte-fp-flexbox-center`;

    if (!select) {
        classes = `${classes} svelte-fp-unselectable`
    }

    const handleSelect = () => {
        if (!select) {
            return false;
        }
    };

</script>

{#if sectionId === activeSection}
    <section transition:slide={transition} class={classes} on:selectstart={handleSelect}>
        <div class="svelte-fp-container svelte-fp-flexbox-expand" class:svelte-fp-flexbox-center={center}>
            <slot>
            </slot>
        </div>
        {#if activeSlide}
            <div class="svelte-fp-indicator">
                <ul class="svelte-fp-indicator-list">
                    {#each slides as page,index}
                        <li class="svelte-fp-indicator-list-item">
                            <button class="svelte-fp-indicator-list-item-btn {activeSlide === index ? 'svelte-fp-active':''}" on:click={ ()=>activeSlide=index }></button>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </section>
{/if}

<style>
    section {
        height: inherit;
        position: relative;
    }
    .svelte-fp-flexbox-expand {
        flex: 1;
    }
    .svelte-fp-container {
        height: inherit;
        width: inherit;
        position: relative;
    }
    .svelte-fp-flexbox-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .svelte-fp-unselectable {
        user-select: none;
    }
    .svelte-fp-indicator {
        height: inherit;
        width: 5rem;
        overflow: hidden;
        position: absolute;
        left: 0;
        right: 0;
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
    .svelte-fp-indicator-list-item {
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
    @media only screen and (max-width: 600px){
        .svelte-fp-indicator {
            display: none;
        }
    }
</style>