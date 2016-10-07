/* global describe */
const path   = require('path');
const fs     = require('fs');
const assert = require('assert');
const babel  = require('babel-core');
const plugin = require('../src/index').default;

function trim(str) {
  return str.replace(/^\s+|\s+$/, '');
}

const fixturesDir = path.join(__dirname, '../src/__test__/fixtures');
const INPUT_POSTFIX = '.input.js';
const OUTPUT_POSTFIX = '.output.js';

describe('emit asserts for: ', () => {
  fs.readdirSync(fixturesDir)
    .filter(caseName => caseName.indexOf(INPUT_POSTFIX) !== -1)
    .map(caseName => {
      it(caseName, () => {
        const name = caseName.substr(0, caseName.length - INPUT_POSTFIX.length);
        const actual = babel.transformFileSync(
          path.join(fixturesDir, name + INPUT_POSTFIX), {
            babelrc: false,
            presets: ['es2015', 'stage-1', 'react'],
            plugins: [
              'syntax-flow',
              plugin
            ]
          }
        ).code;
        const expected = fs.readFileSync(path.join(fixturesDir, name + OUTPUT_POSTFIX)).toString();
        assert.equal(trim(actual), trim(expected));
      });
    });
});
