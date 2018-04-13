const babel = require('babel-core');
const content = `
var React = require('react');

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
      {props.d}
    </div>
  );
};

Foo.propTypes = {
  b: PropTypes.string,
  d: PropTypes.string
};

export default Foo;
`;

it('explicit-prop-types-merge-stateless-test', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
