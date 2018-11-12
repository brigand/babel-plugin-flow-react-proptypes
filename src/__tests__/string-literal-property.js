const babel = require('babel-core');
const content = `
export type T = {
  'read-only': true,
  regular: true
};
`;

it('string-literal-property', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
