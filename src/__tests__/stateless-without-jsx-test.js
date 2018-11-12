const babel = require('babel-core');
const content = `
var React = require('react');

type FooT = {
    x?: number
};

const Foo = function(props: FooT) {
  React.createElement(
    'div',
    null,
    props.x
  );
};

export default Foo;
`;

it('stateless-without-jsx', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
