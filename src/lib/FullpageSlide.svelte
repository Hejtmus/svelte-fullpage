<script>
    import { getContext, onMount } from 'svelte'

    export let title = ''
    const { registerSlide } = getContext('slide')
    const { config: { disableCenter } } = getContext('section')

    // After DOM is ready ged slideId
    onMount(() => {
        registerSlide(title)
    })
</script>

<div class:svelte-fp-flexbox-center={!disableCenter} {...$$restProps}>
    <slot/>
</div>

<style>
    div {
        height: 100%;
        width: 100%;
        min-width: 100%;
        position: relative;
    }
    .svelte-fp-flexbox-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
