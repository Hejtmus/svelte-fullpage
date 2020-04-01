<script>
    import {slide} from 'svelte/transition';

    //<FullpageSectionStatic bind:activeSection sectionId="id"></FullpageSectionStatic>

    let defaultClasses = '';

    export { defaultClasses as class };
    export let sectionId;
    export let activeSection;
    export let center = false;
    export let transition = {
        duration: 750
    };
    sectionId = parseInt(sectionId);

    let classes = `${defaultClasses} svelte-fp-section`;

    if (center) {
        classes = `${classes} svelte-fp-flexbox-center`
    }


</script>

{#if sectionId === activeSection}
    <section transition:slide={transition} class={classes}>
        <slot>
        </slot>
    </section>
{/if}

<style>
    section {
        height: inherit;
        position: relative;
    }
    slot {
        position: absolute;
    }
    .svelte-fp-flexbox-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>