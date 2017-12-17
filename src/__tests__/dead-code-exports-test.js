const babel = require('babel-core');
const { minify } = require('uglify-js');
const content = `
var React = require('react');

export type MyType = string | number;

`;

const opts = {
  babelrc: false,
  presets: ['es2015', 'stage-1', 'react'],
  plugins: ['syntax-flow', [require('../'), { deadCode: '__PROD__' }]],
};

it('dead-code-exports', () => {
  const res = babel.transform(content, opts).code;
  expect(res).toMatch(/__PROD__/);
  expect(res).toMatchSnapshot();
});

it('dead-code-exports uglify', () => {
  const res = babel.transform(content, opts).code
    .replace(/__PROD__/g, 'true');
  const { code: min } = minify(res, { toplevel: true });
  expect(min).not.toMatch(/prop-types/);
  expect(min).toMatchSnapshot();
});
