const babel = require('babel-core');
const content = `
var React = require('react');

type Props = { x: string };
const Foo = (props: Props) => <div />;
`;

it('dead-code-string', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', [require('../'), { deadCode: '__DEV__' }]],
  }).code;
  expect(res).toMatch(/__DEV__\s*\?/);
  expect(res).toMatchSnapshot();
});
