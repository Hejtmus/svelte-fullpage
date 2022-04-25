# Svelte-fullpage

Pure Svelte fullpage component

***This component is actively maintained***

*5.5kB gZipped, unzipped 14.9kB*

Lightweight fullpage Svelte component, no vanilla JS or FullPage.js, just pure Svelte component. There is also support for
mobile devices. Tested on Svelte and Sapper. Note that this component is in development, expect bugs, if you notice some, 
please report them to this component's GitHub repo to the 'Issues' section.

## Instalation

> ```bash
> npm i svelte-fullpage --save-dev
> ```

## How to use

### Static version

1. Make Svelte page
2. Include `import { Fullpage, FullpageSection, FullpageSlide } from 'svelte-fullpage';` into mentioned file.
3. Make fullpage sections and put them into `<Fullpage>`, if you need slides, make them too and put them into some `<FullpageSection>`.
4. Define new arrays that will contain all names of all sections and slides, insert them into Fullpage or FullpageSection
component, example `<Fullpage sections={myFullpageSectionsNames}` or `<FullpageSlide slides={myFullpageSlidesNames}`.
5. You can check if everything is working, if you use Sapper, don't forget to make this component SSR, just include
it like this `import Fullpage from 'svelte-fullpage/src/Fullpage.svelte'` and section as well 
`import FullpageSection from 'svelte-fullpage/src/FullpageSection.svelte'` also slides 
`import FullpageSlide from 'svelte-fullpage/src/FullpageSlide.svelte'`.

NOTE - Fullpage component is positioned **absolute**, it is recommended to put it into element with position **relative**.

### Something copyable

```html
<script>
    //Svelte import
    import { 
        Fullpage,
        FullpageSection,
        FullpageSlide
    } from 'svelte-fullpage';
    //Sapper import
	import Fullpage from 'svelte-fullpage/src/Fullpage.svelte';
	import FullpageSection from 'svelte-fullpage/src/FullpageSection.svelte'
	import FullpageSlide from 'svelte-fullpage/src/FullpageSlide.svelte';

    // Optional, include all titles of your sections
    const sections = [
        'Home',
        'History',
        'Present',
        'Future'
    ];
    
    // Same mechanics as in sections
    const slides = [
        '1982-1993',
        '1993-2006',
        '2006-present'
    ];
</script>

<Fullpage {sections} arrows>
    <FullpageSection center>
        ...Your markup here
    </FullpageSection>
    <FullpageSection {slides} arrows>
        <FullpageSlide>
            ...Your markup here
        </FullpageSlide>
        <FullpageSlide>
            ...Your markup here
        </FullpageSlide>
        <FullpageSlide>
            ...Your markup here
        </FullpageSlide>
    </FullpageSection>
    <FullpageSection>
        ...Your markup here
    </FullpageSection>
    <FullpageSection>
        ...Your markup here
    </FullpageSection>
</Fullpage>

```

If you are not sure how to use this component, take a look at [demo site code](https://github.com/Hejtmus/svelte-fullpage/blob/master/docs/src/App.svelte)

### Tweaks

So, there are options for customizing your fullpage component.

#### Fullpage

These props are customizable:

* **class** - `string` - Standard HTML class
* **style** - `string` - Standard HTML style
* **sections** - `array` - Array containing FullpageSection components/names
* **activeSection** - `number` - Number that points set visibility of sections.
* **transitionDuration** - `number` - Duration of transition between sections
* **arrows** - `boolean` - Adds support for scrolling using arrows
* **drag** - `boolean` - Allows scrolling using mouse drag
* **pullDownToRefresh** - `boolean` - Enables pull down to refresh effect on chrome mobile, default `false`.

#### FullpageSection

These props are customizable:

* **class** - `string` - Standard HTML class
* **style** - `string` - Standard HTML style
* **slides** - `array` - Array containing FullpageSlide components/names, if there are some
* **activeSlide** - `string` - Number that tells slide if is visible
* **center** - `boolean` - Centering content using flexbox
* **arrows** - `boolean` - Adds support for sliding using arrows
* **select** - `boolean` - Enables highlighting
* **transitionDuration** - `number` - Duration of transition between slides, if you want to edit it, edit it here rather than in 
transition prop, because this alters cooldown between transitions.
* **transition** - `object` - Options for transitionOut between this sections
* **dragThreshold** - `number` - Number in pixels, that says, when to switch to another section, if is drag detected on page
* **touchThreshold** - `number` - Number in pixels, that says, when to switch to another section, if is touch detected on page

#### FullpageSlide

These props are customizable:

* **class** - `string` - Standard HTML class
* **style** - `string` - Standard HTML style
* **center** - `number` - Centering content using flexbox
* **transitionIn** - `object` - Options for transitionIn between this slides
* **transitionOut** - `object` - Options for transitionOut between this slides

## License

### It's free

This component is under MIT license.