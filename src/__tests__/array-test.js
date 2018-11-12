const babel = require('babel-core');
const content = `
import React from 'react';

type Props = {
  xs: Array,
  ys?: Array,
};

export default
class ArrayTest extends React.Component<Props> {
}
`;

it('array', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
