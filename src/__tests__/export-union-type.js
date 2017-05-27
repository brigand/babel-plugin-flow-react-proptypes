const babel = require('babel-core');
const content = `
// @flow
export type A = "option1" | "option2";
`;

it('export-union-type', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
