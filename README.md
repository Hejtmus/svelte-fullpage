# Svelte-fullpage

***In development***

Lightweight fullpage Svelte component,

## Instalation

> ```bash
> npm i svelte-fullpage --save-dev
> ```

## How to use

1. Make Svelte page
2. Include `import { Fullpage } from 'svelte-fullpage';` to the mentionde file.
3. Make fullpage sections, put them into separate files and then import that files as a component. I know, it's annoying,
but Fullpage component is dynamically rendered.
4. Import there `FullpageSection`, then use like any other Svelte component with `Slot`. 
5. Define new array that will contain all sections and insert it into Fullpage component, example
`<Fullpage pages={myFullpageSections}`.
6. You can check if everything is working, if you use Sapper, don't forget to make this component SSR, just include
it like this `import Fullpage from 'svelte-fullpage/src/Fullpage.svelte'` and sections as well 
`import FullpageSection from 'svelte-fullpage/src/FullpageSection.svelte'`.

### Something copyable

##### File with wrapper

```html
<script>
    import { Fullpage } from 'svelte-fullpage';

    import myFullpageSection1 from './FpSection1.svelte'
    import myFullpageSection2 from './FpSection2.svelte'
    import myFullpageSection3 from './FpSection3.svelte'
    import myFullpageSection4 from './FpSection4.svelte'

    const pages = [
        myFullpageSection1,
        myFullpageSection2,
        myFullpageSection3,
        myFullpageSection4
    ];
</script>

<Fullpage {pages} />
```

##### File with sections

```html
<script>
    import { FullpageSection } from 'svelte-fullpage';
</script>

<FullpageSection>
    ...Your markup here
</FullpageSection>
```

### Tweaks

So, there are options for customizing your fullpage component.

#### Fullpage

This props are customizable:

* **class** - Standard HTML class
* **pages** - Array containing FullpageSection components
* **animationDuration** - Duration of transition between sections
* **arrows** - Adds support for scrolling using arrows

#### FullpageSection

This props are customizable:

* **class** - Standard HTML class
* **center** - Centering content using flexbox
* **animationDuration** - Duration of transition between this section, I don't recomend using this, becouse it changes only
animarion duration and not the time for preventing 'misscrolls', better edit it in the Fullpage component.

## License

### It's free

This component is under MIT license.