const babel = require('babel-core');
const content = `
var React = require('react');

type Props = {
  foo: empty
}

const C = (props: Props) => <div />;
`;

it('empty-type', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['@babel/env', '@babel/react', '@babel/flow'],
    plugins: [
      '@babel/syntax-flow',
      require('../'),
      "@babel/plugin-proposal-class-properties"
    ],
  }).code;
  expect(res).not.toMatch(/empty/);
  expect(res).toMatchSnapshot();
});