const babel = require('babel-core');
const content = `
var React = require('react');


type U = {
  a: string
};
type V = {|
  b: number
|};

type FooProps = {
  someprop: U | V,
};

export type ExactFooProps = {|
  someprop: U | V,
|};

class Foo extends React.Component {
  props: FooProps;
}

class ExactFoo extends React.Component {
  props: ExactFooProps;
}


`;

it('union-objects-exact', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
