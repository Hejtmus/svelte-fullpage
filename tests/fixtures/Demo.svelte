<script lang="ts">
    import { Fullpage, FullpageSection, FullpageSlide } from '$lib'
    import type { Page } from '$lib'

    interface Props {
        sections: Array<{ id: string, title: string }>,
        slides?: string[],
        onSectionChange?: (page: Page, index: number) => void,
        onSlideChange?: (page: Page, index: number) => void
    }

    let { sections, slides = [], onSectionChange, onSlideChange }: Props = $props()

    let fullpage: ReturnType<typeof Fullpage> | undefined = $state()
    let slideHost: ReturnType<typeof FullpageSection> | undefined = $state()

    export const goTo = (target: string | number) => fullpage?.goTo(target)
    export const next = () => fullpage?.next()
    export const previous = () => fullpage?.previous()
    export const goToSlide = (target: string | number) => slideHost?.goTo(target)
</script>

<Fullpage bind:this={fullpage} {onSectionChange}>
    {#each sections as section (section.id)}
        <FullpageSection id={section.id} title={section.title}>
            <p>{section.title} body</p>
        </FullpageSection>
    {/each}
    {#if slides.length > 0}
        <FullpageSection bind:this={slideHost} id="with-slides" title="With slides" {onSlideChange}>
            {#each slides as slide (slide)}
                <FullpageSlide id={slide} title={slide}>
                    <p>{slide} body</p>
                </FullpageSlide>
            {/each}
        </FullpageSection>
    {/if}
</Fullpage>
