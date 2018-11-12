const babel = require('babel-core');
const content = `
import React from 'react';

type Props = {
  foo: React.Node,
};

class MyComponent extends React.Component<Props, State> {}
`;

it('react-node', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
