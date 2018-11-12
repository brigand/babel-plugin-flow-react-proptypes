const babel = require('babel-core');
const content = `
export type T = string;
export type TOptional = ?string;
`;

it('export-intersection-type', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
