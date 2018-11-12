const babel = require('babel-core');
const content = `
/* @flow */
import React from 'react'
import type { Values } from './values';

class MyComp extends React.Component {
  props: {
    values?: Values
  }
  render() {
    return <div />;
  }
}
`;

it('function-types', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
  expect(res.indexOf('isRequired')).toBe(-1);
});
