const babel = require('babel-core');
const content = `
var React = require('react');

type Choices = 'option1' | 'option2';

type FooT = {
    x?: Choices
};

type FooC = {
    lang: string,
};

const Foo = (props: FooT, context: FooC) => {
  <div>{props.x}</div>
};

export default Foo;
`;

it('parses second argument as contextTypes', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
