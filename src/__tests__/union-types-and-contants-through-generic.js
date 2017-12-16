const babel = require('babel-core');
const content = `
var React = require('react');



type Generic<U> = U | 'bar' | number;

type FooProps = {
  id: Generic<'foo'>,
};



class Foo extends React.Component {
  props: FooProps;
}

export default C;
`;

it('union-types-and-constants-through-generic', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
