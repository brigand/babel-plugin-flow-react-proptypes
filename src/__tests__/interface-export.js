const babel = require('babel-core');
const content = `
export interface Pager {
    next(number): void,
    prev(number): void,
    hasNext: boolean,
    hasPrev: boolean,
}
`;

it('interface-export', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
