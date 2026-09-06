import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Svelte 5 needs nothing but the TypeScript pass vite provides
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter({ pages: 'docs', assets: 'docs' })
    }
}

export default config
