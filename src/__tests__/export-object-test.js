const babel = require('babel-core');
const content = `
export type Foo = {
  a_string: string,
};

console.log('test');
`;

it('export-object', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
