const babel = require('babel-core');
const content = `
var React = require('react');

type T = {
  an_optional_string?: string,
  tupletype: [string, Object]
}

export default function Foo(props: T) {
    <div />
}
`;

it('tupletype', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
