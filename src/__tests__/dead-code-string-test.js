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

it('dead-code-string', () => {
  const res = babel.transform(content, getOpts({ deadCode: '__PROD__' })).code;
  expect(res).toMatch(/__PROD__\s*\?/);
  expect(res).toMatchSnapshot();
});

it('dead-code-string uglify', () => {
  const res = babel.transform(content, getOpts({ deadCode: '__PROD__' })).code
    .replace(/__PROD__/, 'true');
  const { code: min } = minify(res, { toplevel: true });
  expect(min).not.toMatch(/prop-types/);
});

it('dead-code-string with esm', () => {
  const res = babel.transform(content, getOpts({ deadCode: '__PROD__', useESModules: true })).code;
  expect(res).toMatch(/__PROD__\s*\?/);
  expect(res).toMatchSnapshot();
});

it('dead-code-string uglify with esm', () => {
  const res = babel.transform(content, getOpts({ deadCode: '__PROD__', useESModules: true })).code
    .replace(/__PROD__/, 'true');
  const { code: min } = minify(res, { toplevel: true });
  expect(min).not.toMatch(/string/);
  expect(min).toMatchSnapshot();
});
