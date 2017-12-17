const babel = require('babel-core');
const content = `
var React = require('react');

type Props = { x: string };
const Foo = (props: Props) => <div />;
`;

it('dead-code-true', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', [require('../'), { deadCode: true }]],
  }).code;
  expect(res).toMatch(/\.NODE_ENV[^]{1,10}production[^]{1,7}\?/);
  expect(res).toMatchSnapshot();
});
