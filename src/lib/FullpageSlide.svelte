<script>
    import { getContext, onMount } from 'svelte'

    export let title = ''
    export let disableCentering = false
    const { registerSlide } = getContext('slide')

    // After DOM is ready ged slideId
    onMount(() => {
        registerSlide(title)
    })
</script>

<div class:svelte-fp-flexbox-center={!disableCentering} {...$$restProps}>
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
