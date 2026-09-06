import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import { fileURLToPath } from 'node:url'

const alias = { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) }

// Two projects, because the same components have to be compiled twice: for the browser in the
// jsdom suite, and for the server in the SSR smoke test
export default defineConfig({
    test: {
        projects: [
            {
                plugins: [svelte(), svelteTesting()],
                resolve: { alias },
                test: {
                    name: 'client',
                    environment: 'jsdom',
                    setupFiles: ['./tests/setup.ts'],
                    include: ['tests/unit/**/*.test.ts']
                }
            },
            {
                plugins: [svelte()],
                resolve: { alias },
                test: {
                    name: 'ssr',
                    environment: 'node',
                    include: ['tests/ssr/**/*.test.ts']
                }
            }
        ]
    }
})
