const babel = require('babel-core');
const content = `
var React = require('react');
var PropTypes = require('prop-types');

type FooProps = {
  a: number,
  b: number,
  c: string,
}

const Foo = (props: FooProps) => {
  return (
    <div>
      {props.a}
      {props.b}
      {props.c}
    </div>
  );
}

Foo.defaultProps = {
  a: 7
};

export default Foo;
`;

it('optional-default-props-stateless-test', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
