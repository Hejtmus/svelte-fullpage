import adapter from '@sveltejs/adapter-static'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess(),
    package: {
        exports: (filepath) => {
            return filepath.startsWith('index.ts')
        }
    },
    kit: {
        adapter: adapter({ pages: 'docs', assets: 'docs' })
    }
}

export default config
