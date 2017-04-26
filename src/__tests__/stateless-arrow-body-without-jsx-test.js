const babel = require('babel-core');
const content = `
var React = require('react');

const arrowFunctionWithBody = () => window.console;

type Choices = 'option1' | 'option2';

type FooT = {
    x?: Choices
};

const Foo = (props: FooT) => (
  React.createElement(
    'div',
    null,
    props.x
  )
);

export default Foo;
`;

it('stateless-arrow-body-without-jsx', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
