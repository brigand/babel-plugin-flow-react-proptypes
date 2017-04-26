const babel = require('babel-core');
const content = `
/* @flow */

import React, { Element, Component } from "react"

type Props = {
  onClick?: () => void,
}

class MyComponent extends Component<void, Props, void> {
}

export default MyComponent;
`;

it('function-types', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
