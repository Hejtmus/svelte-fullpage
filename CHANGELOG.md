# Changelog

## 2.0.0-alpha.0

A rewrite for Svelte 5, on top of native CSS scroll snapping. See [MIGRATION.md](MIGRATION.md).

### Breaking

- Requires Svelte 5; the `^3 || ^4` peer range is dropped
- The document is the scroll container by default. `<Fullpage>` no longer needs a parent with a
  definite height, and no longer takes the scroll away from the page
- Removed `scrollDuration`, `easing`, `pageRoundingThresholdMultiplier`, `disableArrowsNavigation`
  and `disableCentering`, along with the wheel and tween engine behind them
- `disableDragNavigation` is inverted into `drag`, on both `<Fullpage>` and `<FullpageSection>`
- `on:goto` is replaced by the `onSectionChange` and `onSlideChange` callback props
- `bind:controller` is replaced by `bind:this` with `goTo` / `next` / `previous`, or by the
  `useFullpage()` and `useFullpageSection()` hooks
- Slots are snippets; the internal `.svelte-fp-*` classes are gone

### Added

- `drag`, on by default: a mouse drag pans the native scroller and animates onto the page it was
  heading for on release — the nearest one, or the next one along when it was thrown rather than
  placed. It ignores touch, pen, interactive targets and drags shorter than 5px
- `scroller="self"` for consumers who do want an isolated scrolling box
- `snap` (`mandatory` / `proximity` / `none`) and `scrollPadding`, so a fixed site header does not
  overlap a section
- `hash`: the active section is reflected into `location.hash` with `replaceState`, and an incoming
  hash is honoured on load; `replaceHash` hands that write to a framework router, such as
  SvelteKit's `replaceState`
- `id` on sections and slides — stable identity, DOM id and deep link target, generated when omitted
- `data-active` and `data-index` on sections, slides and indicator buttons, and `--fullpage-*`
  custom properties, for styling from a design system
- Svelte 5 types: components are typed as `Component<Props>`, not `SvelteComponentTyped`

### Fixed

- Sections rendered from a keyed `{#each}` and filtered or reordered at runtime keep their
  indicators and active section in sync; registration is keyed by id and sorted by DOM order
- Programmatic scrolling honours `prefers-reduced-motion: reduce`
- Animated scrolling stands the container's snapping aside for the length of the scroll, which
  otherwise re-snaps mid animation and lands it in a single jump
- A drag belongs to the scroller whose axis it moves along, so dragging up and down over a
  section's slides pans the page while dragging sideways moves the slides
- Snapping is restored on a timer as well as on a frame callback, so a tab that is hidden mid drag
  cannot be left with its snapping switched off
- Indicators are real buttons in a labelled list, named after the section title, with `aria-current`
  and a visible focus ring
- Native scrolling is untouched: pull to refresh, the collapsing mobile URL bar, scroll restoration,
  find in page and print styles keep working
