<script lang="ts">
    import { consumeSlides } from './context'
    import type { FullpageSlideProps } from './types'

    const slides = consumeSlides()
    const generatedId = $props.id()

    let { id = generatedId, title = '', class: className, children, ...rest }: FullpageSlideProps = $props()

    let element: HTMLElement | null = $state(null)

    $effect(() => {
        if (!element) return
        return slides.register({ id, title, element })
    })

    const index = $derived(slides.pages.findIndex(page => page.id === id))
    const isActive = $derived(slides.activeId === id)
</script>

<div bind:this={element} {id} data-index={index} data-active={isActive} {...rest}
    class={['fullpage-slide', className]}>
    {@render children()}
</div>

<style>
    .fullpage-slide {
        flex: 0 0 100%;
        inline-size: 100%;
        min-inline-size: 100%;
        scroll-snap-align: start;
    }
</style>
