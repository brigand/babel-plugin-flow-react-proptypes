const babel = require('babel-core');
const content = `
import React, { Component } from 'react';
import type { Data } from 'types';

class Test extends Component {
  props: Data;

  render() {
    return (
      <div>{this.props.id} {this.props.title}</div>
    );
  }
}

export default Test;
`;

it('basic', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
