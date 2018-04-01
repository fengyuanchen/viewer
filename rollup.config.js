const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const pkg = require('./package');

const now = new Date();
const banner = `/*!
 * Viewer v${pkg.version}
 * https://github.com/${pkg.repository}
 *
 * Copyright (c) 2015-${now.getFullYear()} ${pkg.author.name}
 * Released under the ${pkg.license} license
 *
 * Date: ${now.toISOString()}
 */
`;

module.exports = {
  input: 'src/index.js',
  output: [
    {
      banner,
      file: 'dist/viewer.js',
      format: 'umd',
      name: 'Viewer',
      globals: {
        jquery: 'jQuery',
      },
    },
    {
      banner,
      file: 'dist/viewer.common.js',
      format: 'cjs',
    },
    {
      banner,
      file: 'dist/viewer.esm.js',
      format: 'es',
    },
    {
      banner,
      file: 'docs/js/viewer.js',
      format: 'umd',
      name: 'Viewer',
      globals: {
        jquery: 'jQuery',
      },
    },
  ],
  external: ['jquery'],
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      plugins: ['external-helpers'],
    }),
  ],
};
