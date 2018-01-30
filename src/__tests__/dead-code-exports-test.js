const babel = require('babel-core');
const { minify } = require('uglify-es');
const content = `
import type { DepType } from './dep.js';
export type MyType = string | number | DepType;
`;

const getOpts = opts => ({
  babelrc: false,
  presets: [['es2015', { modules: false }], 'stage-1', 'react'],
  plugins: ['syntax-flow', [require('../'), opts]],
});

it('dead-code-exports', () => {
  const res = babel.transform(content, getOpts({ deadCode: '__PROD__' })).code;
  expect(res).toMatch(/__PROD__/);
  expect(res).toMatchSnapshot();
});

it('dead-code-exports uglify', () => {
  const res = babel.transform(content, getOpts({ deadCode: '__PROD__' })).code
    .replace(/__PROD__/g, 'true');
  const { code: min } = minify(res, { toplevel: true });
  expect(min).not.toMatch(/prop-types/);
  expect(min).toMatchSnapshot();
});

it('dead-code-exports with esm', () => {
  const res = babel.transform(content, getOpts({ deadCode: '__PROD__', useESModules: true })).code;
  expect(res).toMatch(/__PROD__/);
  expect(res).toMatch(/export(\s|\{)/);
  expect(res).toMatchSnapshot();
});

it('dead-code-exports uglify with esm', () => {
  const res = babel.transform(content, getOpts({ deadCode: '__PROD__', useESModules: true })).code
    .replace(/__PROD__/g, 'true');
  const { code: min } = minify(res, { toplevel: true });
  expect(min).toMatch(/export(\s|\{)/);
  expect(min).toMatchSnapshot();
});
