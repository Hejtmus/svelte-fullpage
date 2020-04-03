import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import gzipPlugin from 'rollup-plugin-gzip';

const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

export default {
	input: 'src/index.js',
	output: [
		{ file: pkg.module, 'format': 'es' },
		{ file: pkg.main, 'format': 'umd', name }
	],
	plugins: [
		terser(),
		builtins(),
		svelte(),
		resolve({preferBuiltins: true}),
		gzipPlugin()
	]
};
