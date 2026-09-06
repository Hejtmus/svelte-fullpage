# Migrating from 1.x to 2.0

Version 2 keeps the three component names and the mental model. What changed underneath is the
scroll itself: 1.x moved a container with a JavaScript tween, 2.0 lets the browser scroll and only
describes where the stops are.

## Requirements

- Svelte 5. The `svelte: "^3.0.0 || ^4.0.0"` range is gone.
- Runes mode is not required of the consumer, but slots are: children are snippets now.

## The height and scroll container contract

This is the change that matters most.

**1.x** needed an ancestor with a definite height, because `<Fullpage>` was `height: 100%` and it
scrolled itself. Consumers wrapped it in a fixed or absolutely positioned parent.

**2.0** needs nothing. The document scrolls, `<Fullpage>` is a plain block level wrapper, and each
section is at least `100svh` tall on its own.

```diff
-<div class="position-fixed top-0 start-0 w-100 h-100">
-    <Fullpage>…</Fullpage>
-</div>
+<Fullpage>…</Fullpage>
```

A fixed header, a footer, in-page anchors and print styles now coexist with the sections. If you
have a fixed header, pass its height so sections do not slide underneath it:

```svelte
<Fullpage scrollPadding="4rem">…</Fullpage>
```

Anything rendered after the last section — a footer — needs `scroll-snap-align: start` of its own
under the default `snap="mandatory"`, or use `snap="proximity"`.

If you really want the old isolated scrolling box, ask for it: `<Fullpage scroller="self">`.

## Removed props

The JavaScript scroll engine is gone, and with it every prop that configured it. There is no
replacement, because the browser now owns the behaviour they tuned.

| removed | why | what to do instead |
| --- | --- | --- |
| `scrollDuration` | scrolling is native | the browser's own smooth scrolling, or CSS `scroll-behavior` |
| `easing` | no tween is run | as above |
| `pageRoundingThresholdMultiplier` | no drag maths | native snapping decides |
| `disableDragNavigation` | inverted, and moved onto `<Fullpage>` and `<FullpageSection>` | `drag={false}` |
| `disableArrowsNavigation` | keydown is never intercepted | nothing to disable |
| `disableCentering` | sections no longer force flex centering | center your own content |

New props: `scroller`, `snap`, `scrollPadding`, `drag`, `indicators`, `indicatorLabel`, `hash`.

Dragging survives the rewrite, rebuilt on top of the native scroller: a mouse drag moves the
container's scroll offset instead of a tween, and letting go animates onto the page it landed
nearest — or, for a flick, the next page along, which 1.x had no notion of. `scrollDuration` and
`easing` used to time that landing. The animation is the browser's
own smooth scrolling rather than a tween, so it is not configurable — set `scroll-behavior` or
live with the platform default. Touch and pen are left alone, because they already scroll it.

## Slots become snippets

```diff
 <Fullpage>
-    <FullpageSection title="Home">
-        <h1>Home</h1>
-    </FullpageSection>
+    <FullpageSection title="Home">
+        <h1>Home</h1>
+    </FullpageSection>
 </Fullpage>
```

The markup is unchanged — implicit children still work — but they are compiled as the `children`
snippet, so a runes mode consumer gets no `<slot>` deprecation warnings and no type errors.

## Events become callback props

```diff
-<Fullpage on:goto={handleGoto}>
+<Fullpage onSectionChange={(section, index) => …}>
```

`onSlideChange` is the slide level equivalent, on `<FullpageSection>`. Both receive the page
(`{ id, title, element }`) and its index.

## The controller

```diff
 <script>
-    let controller
+    let fullpage = $state()
 </script>

-<Fullpage bind:controller>…</Fullpage>
-<button on:click={() => controller.goto(2)}>Third</button>
+<Fullpage bind:this={fullpage}>…</Fullpage>
+<button onclick={() => fullpage.goTo(2)}>Third</button>
```

`goTo` accepts an index, as `goto` did, and also a section id. `next()` and `previous()` are new.
The store subscription (`$controller` for the active index) is replaced by `onSectionChange`, or by
`useFullpage()` inside the component tree:

```svelte
<script>
    import { useFullpage } from 'svelte-fullpage'
    const fullpage = useFullpage()
</script>

<p>{fullpage.activeIndex}</p>
```

The same swap applies to a section's slide controller: `bind:controller` on `<FullpageSection>`
becomes `bind:this`, and `useFullpageSection()` is its hook.

## Sections have identity

Sections and slides register by `id` instead of by mount order, so sections rendered from a keyed
`{#each}`, filtered or reordered at runtime, keep their indicators and active state correct. Pass
`id` when you want stable deep links; one is generated otherwise.

```svelte
<FullpageSection id="contact" title="Contact">…</FullpageSection>
```

With `hash`, that id is what appears in the address bar.

## Styling

Scoped overrides of the old internal classes (`.svelte-fp-*`) no longer apply. Style through the
exposed hooks instead: `data-active` / `data-index` on sections, slides and indicator buttons, and
the `--fullpage-*` custom properties listed in the README.
