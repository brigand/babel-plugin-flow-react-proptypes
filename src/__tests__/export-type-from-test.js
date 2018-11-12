const babel = require('babel-core');
const content = `
export type { Foo, Bar } from './types';
`;

it('export-type-from', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;

  expect(res).toMatch(/exports\..*Foo.*Foo/);
  expect(res).toMatch(/exports\..*Bar.*Bar/);
  expect(res).toMatchSnapshot();
});

it('export-type-from-esm', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: [['env', {modules: false}], 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatch(/import.*Foo.*types/);
  expect(res).toMatch(/import.*Bar.*types/);
  expect(res).toMatch(/export.*Foo/);
  expect(res).toMatch(/export.*Bar/);
  expect(res).toMatchSnapshot();
});
