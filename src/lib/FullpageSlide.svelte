<script>
    import { getContext, onMount } from 'svelte'

    let userClasses = ''
    export { userClasses as class }
    export let style = ''
    export let title = ''
    const { registerSlide } = getContext('slide')
    const { config: { disableCenter } } = getContext('section')

    // After DOM is ready ged slideId
    onMount(() => {
        registerSlide(title)
    })
</script>

<div class="{userClasses} svelte-fp-content" style={style} class:svelte-fp-flexbox-center={!disableCenter}>
    <slot/>
</div>

<style>
    .svelte-fp-content {
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
