const babel = require('babel-core');
const content = `
var React = require('react');

export default function Foo({x=1, y='foo'}: {
  x?: number,
  y?: string
}) {
  <div>{x}/{y}</div>
}
`;

it('stateless-inline-defaults', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
