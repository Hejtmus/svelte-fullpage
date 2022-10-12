<script>
    import {getContext, onMount} from "svelte";

    let defaultClasses = ''
    export { defaultClasses as class }
    export let style = ''
    const { getId } = getContext('slide')
    export let center = false

    // After DOM is ready ged slideId
    onMount(()=>{
        getId()
    })
</script>

<div class="{defaultClasses} svelte-fp-content" style={style} class:svelte-fp-flexbox-center={center}>
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
