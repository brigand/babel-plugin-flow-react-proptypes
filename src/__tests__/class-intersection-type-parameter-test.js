const babel = require('babel-core');
const content = `
var React = require('react');

type FooProps = {
  a_number: number
}

export default class Foo extends React.Component<FooProps & {
  b_number: number
}> {
}
`;

it('class-intersection-type-parameter-test', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
