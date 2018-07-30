const babel = require('babel-core');
const content = `
import React from 'react';

type Props = {
  foo: $ReadOnlyArray<number>,
};

class ReadOnlyArrayTest extends React.Component<Props> {}
`;

it('generic-array', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
