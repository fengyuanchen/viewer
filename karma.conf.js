const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const puppeteer = require('puppeteer');

process.env.CHROME_BIN = puppeteer.executablePath();
process.env.NODE_ENV = 'test';

module.exports = (config) => {
  config.set({
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    client: {
      mocha: {
        timeout: 10000,
      },
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
    },
    files: [
      'dist/viewer.css',
      'test/index.js',
      {
        pattern: 'docs/images/*',
        included: false,
      },
    ],
    frameworks: ['mocha', 'chai'],
    preprocessors: {
      'test/index.js': ['rollup'],
    },
    reporters: ['mocha', 'coverage-istanbul'],
    rollupPreprocessor: {
      output: {
        format: 'iife',
        name: 'Anonymous',
        sourcemap: 'inline',
      },
      plugins: [
        nodeResolve(),
        commonjs(),
        babel(),
      ],
    },
    singleRun: true,
  });
};
