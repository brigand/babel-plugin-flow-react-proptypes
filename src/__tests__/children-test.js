const babel = require('babel-core');
const content = `
const React = require('react');

type FooProps = {
  children: React.Element[],
};

function Foo(props: FooProps) {
    <div>{props.children}</div>
}
`;

it('children', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
