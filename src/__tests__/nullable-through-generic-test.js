const babel = require('babel-core');
const content = `
var React = require('react');

type Generic<T> = ?T
type FooProps = {
  foo: Generic<T>,
}

export default class Foo extends React.Component {
  props: FooProps
}
`;

it('nullable', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
