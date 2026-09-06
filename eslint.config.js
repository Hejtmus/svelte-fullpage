import neostandard, { plugins, resolveIgnoresFromGitignore } from 'neostandard'
import svelte from 'eslint-plugin-svelte'
import svelteConfig from './svelte.config.js'

// The codebase indents with 4 spaces rather than neostandard's default of 2
const INDENT = 4

export default [
    ...neostandard({
        ts: true,
        env: ['browser', 'node'],
        ignores: resolveIgnoresFromGitignore()
    }),
    {
        rules: {
            '@stylistic/indent': ['error', INDENT]
        }
    },

    ...svelte.configs['flat/recommended'],
    {
        // .svelte.ts modules hold runes as well, so the svelte parser reads them too
        files: ['**/*.svelte', '**/*.svelte.ts'],
        languageOptions: {
            parserOptions: {
                // Components are written in TypeScript, so the script blocks
                // need the TypeScript parser nested inside the svelte one
                parser: plugins['typescript-eslint'].parser,
                extraFileExtensions: ['.svelte'],
                svelteConfig
            }
        },
        rules: {
            // Props and deriveds are declared with let even though nothing reassigns them,
            // which only svelte's own version of the rule knows about
            'prefer-const': 'off',
            'svelte/prefer-const': 'error'
        }
    },
    {
        files: ['**/*.svelte'],
        rules: {
            // svelte/indent understands markup, @stylistic/indent only sees script blocks
            '@stylistic/indent': 'off',
            'svelte/indent': ['error', { indent: INDENT }],
            // replaceState is only ever handed a hash on the current page, which has no
            // base path to resolve against
            'svelte/no-navigation-without-resolve': ['error', { ignoreReplaceState: true }]
        }
    }
]
