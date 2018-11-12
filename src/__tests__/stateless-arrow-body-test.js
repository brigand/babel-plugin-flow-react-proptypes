const babel = require('babel-core');
const content = `
var React = require('react');

const arrowFunctionWithBody = () => window.console;

type Choices = 'option1' | 'option2';

type FooT = {
    x?: Choices
};

const Foo = (props: FooT) => (
  <div>{props.x}</div>
);

const Bar = (props: FooT) => <div>{props.x}</div>;

export default Foo;
`;

it('stateless-arrow-body', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
