<script lang="ts">
    import { Fullpage, FullpageSection, FullpageSlide } from '$lib'
    import { replaceState } from '$app/navigation'
    import { page } from '$app/state'
    import DemoHeader from './DemoHeader.svelte'
    import DemoFooter from './DemoFooter.svelte'
    import DemoPanel from './DemoPanel.svelte'
    import type { Page } from '$lib'

    // Rendered from a keyed each and filtered at runtime, which is what used to desynchronise
    // the indicators in 1.x
    const chapters = [
        { id: 'document-scroll', title: 'Document scroll', body: 'The window scrolls, so pull to refresh, the collapsing URL bar, find in page and scroll restoration all keep working.' },
        { id: 'no-hijacking', title: 'No hijacking', body: 'The wheel is never intercepted and the active section comes from an IntersectionObserver. A mouse drag pans the same native scroll, and lets go of the snapping only while the button is down.' },
        { id: 'deep-links', title: 'Deep links', body: 'Every section has a stable id. With the hash prop the address bar follows the scroll and an incoming hash is honoured on load.' }
    ]

    let fullpage: ReturnType<typeof Fullpage> | undefined = $state()
    let hidden: string[] = $state([])
    let activeTitle = $state('Svelte fullpage')

    const visibleChapters = $derived(chapters.filter(chapter => !hidden.includes(chapter.id)))

    const toggleChapter = (id: string) => {
        hidden = hidden.includes(id) ? hidden.filter(known => known !== id) : [...hidden, id]
    }

    const onSectionChange = (section: Page) => {
        activeTitle = section.title
    }
</script>

<svelte:head>
    <title>svelte-fullpage</title>
</svelte:head>

<DemoHeader {activeTitle}
    onGoTo={target => fullpage?.goTo(target)}
    onPrevious={() => fullpage?.previous()}
    onNext={() => fullpage?.next()}
/>

<!-- replaceHash keeps the hash on SvelteKit's own history stack -->
<Fullpage bind:this={fullpage} scrollPadding="var(--chrome-height)" hash {onSectionChange}
    replaceHash={hash => replaceState(new URL(hash, page.url), {})}>
    <FullpageSection id="intro" title="Svelte fullpage" class="section-intro">
        <DemoPanel heading="Sections that snap, on the page's own scroll">
            <p>
                A fixed header, full page sections and a footer on one ordinary document. Scroll,
                swipe, drag with the mouse or use the keyboard — nothing is
                intercepted.
            </p>
            <p class="controls">
                {#each chapters as chapter (chapter.id)}
                    <button type="button" onclick={() => toggleChapter(chapter.id)}>
                        {hidden.includes(chapter.id) ? 'Show' : 'Hide'} “{chapter.title}”
                    </button>
                {/each}
            </p>
            <p class="hint">
                Hiding a section removes it from the indicators immediately, because sections
                register by id rather than by mount order.
            </p>
        </DemoPanel>
    </FullpageSection>

    <FullpageSection id="slides" title="Slides" class="section-slides">
        <FullpageSlide id="slides-intro" title="Horizontal slides">
            <DemoPanel heading="Slides use the same mechanism, one axis over">
                <p>Swipe, scroll sideways, or focus the track and use the arrow keys.</p>
            </DemoPanel>
        </FullpageSlide>
        <FullpageSlide id="slides-native" title="Native snapping">
            <DemoPanel heading="scroll-snap-type: x mandatory">
                <p>The track is a plain horizontal scroller, so momentum and rubber banding are the browser's.</p>
            </DemoPanel>
        </FullpageSlide>
        <FullpageSlide id="slides-a11y" title="Accessible indicators">
            <DemoPanel heading="Indicators are buttons">
                <p>Real buttons in a labelled list, with <code>aria-current</code> and a visible focus ring.</p>
            </DemoPanel>
        </FullpageSlide>
    </FullpageSection>

    {#each visibleChapters as chapter (chapter.id)}
        <FullpageSection id={chapter.id} title={chapter.title} class="section-{chapter.id}">
            <DemoPanel heading={chapter.title}>
                <p>{chapter.body}</p>
            </DemoPanel>
        </FullpageSection>
    {/each}
</Fullpage>

<DemoFooter/>

<style>
    .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
    }
    .hint {
        opacity: 0.8;
        font-size: 0.9rem;
    }
</style>
