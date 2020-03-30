# Svelte-fullpage

Lightweight fullpage Svelte component,

## Instalation

> ```bash
> npm i svelte-fullpage --save-dev
> ```

## How to use

1. Make Svelte page
2. Include `import { Fullpage } from 'svelte-fullpage';` to the mentionde file.
3. Make fullpage sections, I recommend putting them into separate file and then importing that file as a component.
4. If you decided to define your sections inside separate file, import there `FullpageSection`, then use like any other 
Svelte component with `Slot`. If you decided to write fullpage sections into the same file as wrapper, append to import
from step 2 `FullpageSection` and then instantiate using `new` into array with fullpage sections.
5. Define new array (if you haven't) that will contain all sections and insert it into Fullpage component, example
`<Fullpage pages={myFullpageSections}`.
6. You can check if everything is working, if you use Sapper, don't forget to make this component SSR, just include
it like this `import Fullpage from 'svelte-fullpage/src/Fullpage'` and sections as well 
`import FullpageSection from 'svelte-fullpage/src/FullpageSection'`.

### Tweaks

So, there are options for customizing your fullpage component.

## License

### It's free

This component is under MIT license.