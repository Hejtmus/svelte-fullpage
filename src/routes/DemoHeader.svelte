<script lang="ts">
    interface Props {
        /** Title of the section the reader is currently on. */
        activeTitle: string,
        onGoTo: (target: string | number) => void,
        onPrevious: () => void,
        onNext: () => void
    }

    let { activeTitle, onGoTo, onPrevious, onNext }: Props = $props()
</script>

<header>
    <strong>svelte-fullpage</strong>
    <span class="active">{activeTitle}</span>
    <nav aria-label="Section navigation">
        <button type="button" onclick={onPrevious}>Previous</button>
        <button type="button" onclick={onNext}>Next</button>
        <button type="button" onclick={() => onGoTo('slides')}>Go to slides</button>
        <button type="button" onclick={() => onGoTo(0)}>Go to first</button>
    </nav>
</header>

<style>
    header {
        position: fixed;
        inset-block-start: 0;
        inset-inline: 0;
        z-index: 200;
        display: flex;
        gap: 1rem;
        align-items: center;
        block-size: var(--chrome-height);
        padding-inline: 1.5rem;
        background: rgb(15 23 42 / 0.85);
        backdrop-filter: blur(8px);
        border-block-end: 1px solid rgb(248 250 252 / 0.12);
    }
    .active {
        color: var(--accent);
    }
    nav {
        display: flex;
        gap: 0.5rem;
        margin-inline-start: auto;
    }
    @media (max-width: 700px) {
        .active {
            display: none;
        }
        nav button:nth-child(n + 3) {
            display: none;
        }
    }
</style>
