const babel = require('babel-core');
const { minify } = require('uglify-js');
const content = `
var React = require('react');

type Props = { x: string };
const Foo = (props: Props) => <div />;
`;

const opts = {
  babelrc: false,
  presets: ['es2015', 'stage-1', 'react'],
  plugins: ['syntax-flow', [require('../'), { deadCode: true }]],
};

it('dead-code-true', () => {
  const res = babel.transform(content, opts).code;
  expect(res).toMatch(/\.NODE_ENV[^]{1,10}production[^]{1,7}\?/);
  expect(res).toMatchSnapshot();
});

it('dead-code-true uglify', () => {
  const res = babel.transform(content, opts).code
    .replace(/process.env.NODE_ENV/, '"production"');
  const { code: min } = minify(res, { toplevel: true });
  expect(min).not.toMatch(/prop-types/);
  expect(min).toMatchSnapshot();
});
