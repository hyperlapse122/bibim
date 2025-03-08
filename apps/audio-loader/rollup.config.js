import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import nodeExternals from 'rollup-plugin-node-externals';

/**
 * Configuration object for the build process.
 *
 * @type {import('rollup').RollupOptions} Config
 * @property {string} input - The input file path for the application.
 * @property {Object} output - Configuration for the output file.
 * @property {string} output.file - The output file path for the bundled application.
 * @property {string} output.format - The module format for the output file (e.g., 'esm').
 * @property {Array} plugins - An array of plugins used during the build process.
 */
const config = {
  input: 'src/server.ts',
  output: {
    file: 'dist/server.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    commonjs(),
    resolve(),
    nodeExternals(),
    json(),
    esbuild({
      target: 'esnext',
      treeShaking: true,
      minify: true,
      sourceMap: true,
      tsconfig: './tsconfig.json',
    }),
  ],
};

export default config;
