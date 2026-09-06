# svelte-fullpage

Lightweight fullpage sections for Svelte 5.

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Hejtmus/svelte-fullpage/nodejs.yml)
![version](https://img.shields.io/npm/v/svelte-fullpage)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/svelte-fullpage)
![license](https://img.shields.io/github/license/Hejtmus/svelte-fullpage)
[![GitHub issues](https://img.shields.io/github/issues/Hejtmus/svelte-fullpage)](https://github.com/Hejtmus/svelte-fullpage/issues)
![downloads](https://img.shields.io/npm/dw/svelte-fullpage)

Version 2 is a thin layer over native CSS scroll snapping. It does not run a scroll engine, it
does not take the scroll away from the document, and it does not need a parent of a fixed height.
A fixed header, a footer and full page sections coexist on one ordinary page.

Coming from 1.x? See [MIGRATION.md](MIGRATION.md).

## Installation

```bash
npm i svelte-fullpage
```

Requires Svelte 5.

## The mental model

- `<Fullpage>` wraps the sections and tracks which one is on screen
- `<FullpageSection>` is one snap stop, at least one viewport tall
- `<FullpageSlide>` is a horizontal snap stop inside a section

The **document** is the scroll container by default, so pull to refresh, the collapsing mobile
URL bar, scroll restoration, find in page and print styles all keep working. Nothing listens to
the wheel. A mouse drag pans that same native scroll, which is the one thing a mouse cannot do on
its own — see [dragging](#dragging).

## Usage

```svelte
<script lang="ts">
    import { Fullpage, FullpageSection, FullpageSlide } from 'svelte-fullpage'
</script>

<Fullpage scrollPadding="4rem" hash>
    <FullpageSection id="home" title="Home">
        <h1>Home</h1>
    </FullpageSection>

    <FullpageSection id="history" title="History">
        <FullpageSlide title="1982">…</FullpageSlide>
        <FullpageSlide title="1993">…</FullpageSlide>
    </FullpageSection>
</Fullpage>
```

Children are snippets, so anything may sit between the sections, including your own markup.

### With a fixed header and a footer

```svelte
<SiteHeader/>

<Fullpage scrollPadding="var(--header-height)">
    <FullpageSection id="home" title="Home">…</FullpageSection>
    <FullpageSection id="work" title="Work">…</FullpageSection>
</Fullpage>

<SiteFooter/>
```

`scrollPadding` becomes `scroll-padding-top` on the scroll container, so a section comes to rest
below the header instead of underneath it, and it is subtracted from the default section height.

With the default `snap="mandatory"`, anything after the last section needs a snap stop of its own
to stay reachable:

```css
footer {
    scroll-snap-align: start;
}
```

Alternatively use `snap="proximity"`, which only snaps when the scroll ends close to a section.

### Deep linking

`hash` writes the active section's id into the address bar with `replaceState`, and scrolls to an
incoming hash on load. In a SvelteKit app, hand the write to the router so it keeps owning the
history stack:

```svelte
<script lang="ts">
    import { replaceState } from '$app/navigation'
    import { page } from '$app/state'
</script>

<Fullpage hash replaceHash={hash => replaceState(new URL(hash, page.url), {})}>…</Fullpage>
```

## Navigation

Hold the component with `bind:this` and call it from anywhere on the page:

```svelte
<script lang="ts">
    import { Fullpage, FullpageSection } from 'svelte-fullpage'

    let fullpage: ReturnType<typeof Fullpage> | undefined = $state()
</script>

<button onclick={() => fullpage?.goTo('work')}>Work</button>
<button onclick={() => fullpage?.next()}>Next</button>

<Fullpage bind:this={fullpage}>…</Fullpage>
```

`goTo` takes a section id or an index. `<FullpageSection>` exposes the same three methods for its
slides.

Inside the component tree, the hooks read the same state reactively:

```svelte
<script lang="ts">
    import { useFullpage } from 'svelte-fullpage'

    // has to be called while the component initialises, like getContext
    const fullpage = useFullpage()
</script>

<p>{fullpage.activeSection?.title} — {fullpage.activeIndex + 1} of {fullpage.sections.length}</p>
```

`useFullpageSection()` is the slide level counterpart, with `slides`, `activeSlide`, `activeIndex`,
`goTo`, `next` and `previous`.

## Props

### `<Fullpage>`

| prop | type | default | |
| --- | --- | --- | --- |
| `scroller` | `'document' \| 'self'` | `'document'` | `'self'` makes the component an isolated scrolling box instead of letting the page scroll |
| `snap` | `'mandatory' \| 'proximity' \| 'none'` | `'mandatory'` | strictness of the CSS snapping |
| `scrollPadding` | `string` | `'0px'` | CSS length kept clear above each section, for a fixed header |
| `drag` | `boolean` | `true` | let a mouse drag scroll the sections, and the slides of every section |
| `indicators` | `boolean` | `true` | render the dot navigation |
| `indicatorLabel` | `string` | `'Sections'` | accessible name of the dot list |
| `hash` | `boolean` | `false` | reflect the active section into `location.hash` and honour an incoming hash on load |
| `replaceHash` | `(hash: string) => void` | `history.replaceState` | writes the hash; SvelteKit apps pass `replaceState` from `$app/navigation` |
| `onSectionChange` | `(section, index) => void` | | called whenever the active section changes |

Any other attribute (`class`, `style`, `data-*`, …) lands on the wrapper element.

### `<FullpageSection>`

| prop | type | default | |
| --- | --- | --- | --- |
| `id` | `string` | generated | stable identity, the DOM id, and the deep link target |
| `title` | `string` | `''` | accessible name of the section's indicator |
| `drag` | `boolean` | inherited | let a mouse drag scroll this section's slides |
| `indicators` | `boolean` | `true` | render slide dots when the section has slides |
| `indicatorLabel` | `string` | `'<title> slides'` | accessible name of the slide dot list |
| `onSlideChange` | `(slide, index) => void` | | called whenever the active slide changes |

### `<FullpageSlide>`

| prop | type | default | |
| --- | --- | --- | --- |
| `id` | `string` | generated | stable identity and DOM id |
| `title` | `string` | `''` | accessible name of the slide's indicator |

## Dragging

Touch and pen already scroll a snapping container, so `drag` is about the mouse: holding the
button and moving pans the container's own scroll offset, and letting go lets CSS snap to the
nearest page. Snapping is released only while the button is down, so a drag is not fought by the
snap it is heading for.

Letting go scrolls onto the page it was heading for — the nearest one, or the next one along if
it was thrown rather than placed, the way touch and trackpad flings already behave. The scroll is
animated — the settle CSS
snapping performs on its own is an instant jump. For the length of any animated scroll, whether
from a drag, an indicator or `goTo`, the container's snapping stands aside: left on, it re-snaps
mid animation and turns the scroll into that same jump. It is put back once the scrolling stops.

Which scroller a drag belongs to is decided by the direction it moves, not by what it started on:
dragging up and down over a section's slides pans the page, dragging left and right moves the
slides. It stays out of the way of everything else: it ignores touch and pen, ignores drags that start on
a link, a button, a form control or anything marked `data-no-drag`, needs 5px of travel before it
engages, and swallows the click that would otherwise fire where the drag ended. Turn it off per
section with `<FullpageSection drag={false}>`, or everywhere with `<Fullpage drag={false}>`.

## Styling

Nothing is themed. Sections and slides carry `data-index` and `data-active`, indicator buttons
carry `data-index`, `data-active` and `aria-current`, so they can be styled from a design system
without fighting scoped CSS.

```css
.fullpage-section[data-active='true'] h2 { … }
```

The rest is custom properties:

| property | default | |
| --- | --- | --- |
| `--fullpage-section-height` | `calc(100svh - var(--fullpage-scroll-padding, 0px))` | minimum height of a section |
| `--fullpage-height` | `100svh` | height of the box in `scroller="self"` mode |
| `--fullpage-snap-stop` | `normal` | set to `always` to forbid skipping sections in one fling |
| `--fullpage-indicator-color` | `rgb(0 0 0 / 0.35)` | |
| `--fullpage-indicator-active-color` | `currentColor` | |
| `--fullpage-indicator-size` | `0.75rem` | |
| `--fullpage-indicator-active-scale` | `1.4` | |
| `--fullpage-indicators-gap` | `0.75rem` | |
| `--fullpage-indicators-offset` | `1rem` | distance from the viewport edge |
| `--fullpage-indicators-z-index` | `100` | |
| `--fullpage-indicator-focus-ring` | `2px solid currentColor` | |
| `--fullpage-track-focus-ring` | `2px solid currentColor` | focus ring of a slide track |

## Accessibility

- indicators are real `<button>`s in a labelled `<nav>`, named after the section `title`, with
  `aria-current` on the active one and a visible focus ring
- programmatic scrolling honours `prefers-reduced-motion: reduce` and jumps instead of animating
- a slide track is a labelled group and is keyboard focusable, so arrow keys scroll it
- keyboard scrolling of the page itself is the browser's own, because the scroll is never taken
  away from the document

## Server rendering

The package renders on the server; `window`, `document` and `IntersectionObserver` are only ever
touched from `$effect`. Sections render with their ids, so links to `#section-id` work before
hydration.

## License

MIT
