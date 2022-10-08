<script>
    import {getContext, onMount} from "svelte";

    let defaultClasses = '';
    export { defaultClasses as class };
    export let style = '';
    const { getId } = getContext('slide')
    export let center = false;
    export let transitionIn = {
        duration: 500,
        x: -2000
    };
    export let transitionOut = {
        duration: 500,
        x: 2000
    };

    // After DOM is ready ged slideId
    onMount(()=>{
        getId()
    })
</script>

<div class={`${defaultClasses} svelte-fp-content`} style={style} class:svelte-fp-flexbox-center={center}>
    <slot/>
</div>

<style>
    .svelte-fp-content {
        height: inherit;
        width: inherit;
        position: relative;
        scroll-snap-align: center;
        scroll-snap-stop: always;
    }
    .svelte-fp-flexbox-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
