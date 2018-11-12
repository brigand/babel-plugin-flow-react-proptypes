const babel = require('babel-core');
const content = `
var React = require('react');

type FooProps = {
  foo: ?string,
}

export default class Foo extends React.Component {
  props: FooProps
}
`;

it('nullable', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
