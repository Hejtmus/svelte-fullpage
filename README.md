# Svelte-fullpage

Lightweight fullpage Svelte component.

[![js-standard-style](https://cdn.rawgit.com/standard/standard/master/badge.svg)](http://standardjs.com)

Makes scrolling pages by sections.

## Instalation

> ```bash
> npm i svelte-fullpage -D
> ```

## How to use

To make things clear:
- `<Fullpage>` is wrapper of its sections which can be scrolled vertically to navigate between sections
- `<FullpageSection>` is section that takes entire viewport and optionally can be scrolled horizontally to navigate between slides
- `<FullpageSlide>` analogy of section which is child of section

### Static version

1. Include `import { Fullpage, FullpageSection, FullpageSlide } from 'svelte-fullpage'` into desired page.
2. Make fullpage sections and put them into `<Fullpage>`, if you need slides, make them too and put them into some `<FullpageSection>`.
3. If needed, make `<FullpageSlide>`s and place them inside some `<FullpageSection>`.

### Example code

```html
<script>
    import { 
        Fullpage,
        FullpageSection,
        FullpageSlide
    } from 'svelte-fullpage'
</script>

<Fullpage>
    <FullpageSection title="Home">
        ...Your markup here
    </FullpageSection>
    <FullpageSection title="History">
        <FullpageSlide title="1982-1993">
            ...Your markup here
        </FullpageSlide>
        <FullpageSlide title="1993-2006">
            ...Your markup here
        </FullpageSlide>
        <FullpageSlide title="2006-present">
            ...Your markup here
        </FullpageSlide>
    </FullpageSection>
    <FullpageSection title="Present">
        ...Your markup here
    </FullpageSection>
    <FullpageSection title="Future">
        ...Your markup here
    </FullpageSection>
</Fullpage>

```

If you are not sure how to use this component, take a look at [demo site code](https://github.com/Hejtmus/svelte-fullpage/blob/master/src/routes/%2Bpage.svelte)

### Tweaks

These are options for customizing your fullpage component. In addition to these props feel free to use HTML customization 
props such as class, style, ....
 
#### Fullpage

- **scrollDuration** - `number` default: `750` - Duration of scroll and next scroll timeout in milliseconds
- **pageRoundingThresholdMultiplier** - `number` default: `8` - Number which sets scroll sensitivity, bigger number, 
less needed scrolling effort. `n` means user have to make scroll delta `1/n` of viewport height/width in order to get to new page.
- **disableDragNavigation** - `boolean` default: `false` - Disables pointer drag navigation
- **disableArrowsNavigation** - `boolean` default: `false` - Disables navigation using arrow keys
- **easing** - `function` default: `quartOut` - Custom easing function which will be applied to scrolling sections and slides

#### FullpageSection

- **title** - `string` - Title of section displayed on hover effect on section indicator
- **disableCentering** - `string` - Disabled flexbox centering of section's content

#### FullpageSlide

- **title** - `string` - Title of slide displayed on hover effect on slide indicator
- **disableCentering** - `string` - Disabled flexbox centering of slide's content

## License

### It's free

This component is under MIT license.
