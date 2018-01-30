const babel = require('babel-core');
const { minify } = require('uglify-es');
const content = `
var React = require('react');

type Props = { x: string };
const Foo = (props: Props) => <div />;
`;

const getOpts = opts => ({
  babelrc: false,
  presets: [['es2015', { modules: false }], 'stage-1', 'react'],
  plugins: ['syntax-flow', [require('../'), opts]],
});

it('dead-code-true', () => {
  const res = babel.transform(content, getOpts({ deadCode: true, useESModules: false })).code;
  expect(res).toMatch(/\.NODE_ENV[^]{1,10}production[^]{1,7}\?/);
  expect(res).toMatchSnapshot();
});

it('dead-code-true uglify', () => {
  const res = babel.transform(content, getOpts({ deadCode: true, useESModules: false })).code
    .replace(/process.env.NODE_ENV/, '"production"');
  const { code: min } = minify(res, { toplevel: true });
  expect(min).not.toMatch(/prop-types/);
  expect(min).toMatchSnapshot();
});

it('dead-code-true with esm', () => {
  const res = babel.transform(content, getOpts({ deadCode: true })).code;
  expect(res).toMatch(/\.NODE_ENV[^]{1,10}production[^]{1,7}\?/);
  expect(res).toMatchSnapshot();
});

it('dead-code-true uglify with esm', () => {
  const res = babel.transform(content, getOpts({ deadCode: true })).code
    .replace(/process.env.NODE_ENV/, '"production"');
  const { code: min } = minify(res, { toplevel: true });
  expect(min).not.toMatch(/string/);
  expect(min).toMatchSnapshot();
});
