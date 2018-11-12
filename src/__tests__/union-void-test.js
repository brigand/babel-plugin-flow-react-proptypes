const babel = require('babel-core');
const content = `
var React = require('react');

type Props = {
  foo: string | void,
};

function C(props: Props) {
  return <div>{props.foo}</div>;
}
`;

it('union-void', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
