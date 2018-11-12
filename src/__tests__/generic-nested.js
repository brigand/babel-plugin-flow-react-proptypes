const babel = require('babel-core');
const content = `
import React from 'react';

type Generic<T> = T | number;
type Generic2<A> = Generic<A> | bool;
type Props = {
  foo: Generic2<string>,
};

export default
class ArrayTest extends React.Component<Props> {
}
`;

it('generic-nested', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
