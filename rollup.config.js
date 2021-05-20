import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json';
import gzipPlugin from 'rollup-plugin-gzip';
let gzip = () => {};

const dev = process.env.BUILD;

if (dev) gzip = gzipPlugin;

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
		svelte(),
		resolve(),
		gzip()
	]
};
