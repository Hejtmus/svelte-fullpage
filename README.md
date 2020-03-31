# Svelte-fullpage

***In development***

Lightweight fullpage Svelte component, no vanilla JS or FullPage.js, just pure Svelte component. Tested on Svelte and Sapper.

## Instalation

> ```bash
> npm i svelte-fullpage --save-dev
> ```

## Versions of this component

There are 2 versions of fullpage component included, static and dynamic, static si statically rendered and dynamic 
dynamically, kinda obvious. For developer using this component means that he has choice. In this ***module*** version, I
recommend using static component.

### Difference between static and dynamic component version

There is not much difference, but major difference between them is if you use static component version can put 
`<FullpageSectionStatic>` into same file as `<FullpageStatic>`, using dynamic component version you must put 
`<FullpageDynamic>` and `<FullpageSectionDynamic>` into separate file.

It seems like maintaining dynamic version is completely pointless, but in the future dynamic version may get extra features.

For 100% experience use static component version, because in this ***module*** version, `<FullpageDynamic>`
has confusing animations and is not that easy (as you maybe think) to fix it.

## How to use

### Static version

1. Make Svelte page
2. Include `import { FullpageStatic, FullpageSectionStatic } from 'svelte-fullpage';` into mentioned file.
3. Make fullpage sections and put them into `<FullpageStatic>`.
4. Define new array that will contain all names of all sections and insert it into Fullpage component, example
`<FullpageStatic sections={myFullpageSectionNames}`.
5. You can check if everything is working, if you use Sapper, don't forget to make this component SSR, just include
it like this `import FullpageStatic from 'svelte-fullpage/src/FullpageStatic.svelte'` and section as well 
`import FullpageSectionStatic from 'svelte-fullpage/src/FullpageSectionStatic.svelte'`.

### Dynamic version

1. Make Svelte page
2. Include `import { FullpageDynamic } from 'svelte-fullpage';` to the mentioned file, for 100% experience use static
component version, because in this module version, `<FullpageDynamic>` has confusing animations.
3. Make fullpage sections, put them into separate files and then import that files as a component. I know, it's annoying.
4. Define new array that will contain all sections and insert it into Fullpage component, example
`<FullpageDynamic sections={myFullpageSections}`.
5. You can check if everything is working, if you use Sapper, don't forget to make this component SSR, just include
it like this `import FullpageDynamic from 'svelte-fullpage/src/FullpageDynamic.svelte'` and sections as well 
`import FullpageSectionDynamic from 'svelte-fullpage/src/FullpageSectionDynamic.svelte'`.

### Something copyable

#### Static version

##### Only file

```html
<script>
    import { 
        FullpageStatic,
        FullpageSectionStatic
    } from 'svelte-fullpage';

    const sections = [
        'Home',
        'History',
        'Present',
        'Future'
    ];
    let activeSection;
</script>

<FullpageStatic bind:activeSction {sections}>
    <FullpageSectionStaatic sectionId="0" bind:activeSction>
        ...Your markup here
    </FullpageSectionStaatic>
    <FullpageSectionStaatic sectionId="1" bind:activeSction>
        ...Your markup here
    </FullpageSectionStaatic>
    <FullpageSectionStaatic sectionId="2" bind:activeSction>
        ...Your markup here
    </FullpageSectionStaatic>
    <FullpageSectionStaatic sectionId="3" bind:activeSction>
        ...Your markup here
    </FullpageSectionStaatic>
</FullpageStatic>

```

#### Dynamic version

##### File with wrapper

```html
<script>
    import { FullpageDynamic } from 'svelte-fullpage';

    import myFullpageSection1 from './FpSection1.svelte'
    import myFullpageSection2 from './FpSection2.svelte'
    import myFullpageSection3 from './FpSection3.svelte'
    import myFullpageSection4 from './FpSection4.svelte'

    const sections = [
        myFullpageSection1,
        myFullpageSection2,
        myFullpageSection3,
        myFullpageSection4
    ];
</script>

<FullpageDynamic {sections} />
```

##### File with sections

```html
<script>
    import { FullpageSectionDynamic } from 'svelte-fullpage';
</script>

<FullpageSectionDynamic>
    ...Your markup here
</FullpageSectionDynamic>
```

### Tweaks

So, there are options for customizing your fullpage component.

#### Fullpage

This props are customizable:

* **class** - Standard HTML class
* **sections** - Array containing FullpageSection components/names
* **activeSection** - Number that points set visibility of sections ****Only static component version***
* **animationDuration** - Duration of transition between sections
* **arrows** - Adds support for scrolling using arrows

#### FullpageSection

This props are customizable:

* **class** - Standard HTML class
* **activeSection** - Number that tells section if is visible ****Only static component version***
* **center** - Centering content using flexbox
* **transition** - Transition between this sections, I don't recommend using this, because if you change duration, it changes only
animation duration and not the time for preventing 'misscrolls', better edit it in the Fullpage component, but you can
adjust other parameters like: "y, x, etc...". 

****Transition prop is editable only in static component version, dynamic version uses for this instead 2 props, 
transitionIn and transitionOut. These animations are Svelte animations, you can change only options, not type of
animation, because I hard-coded it there :D, may change in future .***

## License

### It's free

This component is under MIT license.