const babel = require('babel-core');
const content = `
/* @flow */

const NotComponent = (x: number, y: number): number => {
  return x + y;
};

`;

it('function-types', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res.indexOf('prop-types')).toBe(-1);
  expect(res).toMatchSnapshot();
});
