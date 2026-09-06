<script lang="ts">
    import type { PageRegistry } from '../registry.svelte'

    interface Props {
        registry: PageRegistry,
        /** Accessible name of the list, e.g. "Sections". */
        label: string,
        /** Name given to a page that was registered without a title. */
        fallbackLabel: string,
        orientation: 'vertical' | 'horizontal',
        /** Vertical indicators outlive the sections they point at, so they are pinned to the viewport. */
        position: 'fixed' | 'absolute'
    }

    let { registry, label, fallbackLabel, orientation, position }: Props = $props()

    const nameOf = (title: string, index: number) => title || `${fallbackLabel} ${index + 1}`
</script>

<nav class="fullpage-indicators" data-orientation={orientation} data-position={position} aria-label={label}>
    <ul>
        {#each registry.pages as page, index (page.id)}
            {@const isActive = registry.activeId === page.id}
            <li>
                <button type="button" data-index={index} data-active={isActive}
                    aria-current={isActive ? 'true' : undefined}
                    onclick={() => registry.goTo(page.id)}>
                    <span class="dot" aria-hidden="true"></span>
                    <span class="name">{nameOf(page.title, index)}</span>
                </button>
            </li>
        {/each}
    </ul>
</nav>

<style>
    nav {
        z-index: var(--fullpage-indicators-z-index, 100);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    nav[data-position='fixed'] {
        position: fixed;
    }
    nav[data-position='absolute'] {
        position: absolute;
    }
    nav[data-orientation='vertical'] {
        inset-block: 0;
        inset-inline-end: var(--fullpage-indicators-offset, 1rem);
    }
    nav[data-orientation='horizontal'] {
        inset-inline: 0;
        inset-block-end: var(--fullpage-indicators-offset, 1rem);
    }
    ul {
        display: flex;
        flex-direction: column;
        gap: var(--fullpage-indicators-gap, 0.75rem);
        margin: 0;
        padding: 0;
        list-style: none;
    }
    nav[data-orientation='horizontal'] ul {
        flex-direction: row;
    }
    button {
        display: block;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        line-height: 0;
    }
    button:focus-visible {
        outline: var(--fullpage-indicator-focus-ring, 2px solid currentColor);
        outline-offset: 2px;
    }
    .dot {
        display: block;
        inline-size: var(--fullpage-indicator-size, 0.75rem);
        block-size: var(--fullpage-indicator-size, 0.75rem);
        border-radius: 50%;
        background: var(--fullpage-indicator-color, rgb(0 0 0 / 0.35));
        transition: background-color 200ms, transform 200ms;
    }
    button[data-active='true'] .dot {
        background: var(--fullpage-indicator-active-color, currentColor);
        transform: scale(var(--fullpage-indicator-active-scale, 1.4));
    }
    /* The title is the button's accessible name, and stays available to screen readers only */
    .name {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }
    @media (prefers-reduced-motion: reduce) {
        .dot {
            transition: none;
        }
    }
</style>
