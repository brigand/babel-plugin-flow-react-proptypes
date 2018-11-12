const babel = require('babel-core');
const content = `
var React = require('react');


type U = {
  a: string
};
type V = {
  b: number
};

type FooProps = {
  union: U | V,
};


class Foo extends React.Component {
  props: FooProps;
}

export default C;
`;

it('union-objects', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
