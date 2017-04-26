const babel = require('babel-core');
const content = `
// @flow
var React = require('react');
import type { ExternalType } from '../types';

export default class Foo extends React.Component {
  props: {
    a_number: number,
    external: ExternalType,
  }

  render () {
    return <div />
  }
}
`;

it('class-inline-props', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
