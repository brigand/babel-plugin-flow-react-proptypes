const babel = require('babel-core');
const content = `
import type { Foo, Bar } from './types';
var React = require('react');

type Props = {
  foo: Foo,
  bar: Bar,
}

const C = (props: Props) => <div />;
`;

it('imports-two-types-172', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: [['env', { modules: false }], 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatch(/\{\s*bpfrpt_proptype_Foo/);
  expect(res).toMatch(/\{\s*bpfrpt_proptype_Bar/);
  expect(res).toMatch(/typeof bpfrpt_proptype_Bar/);
  expect(res).toMatchSnapshot();
});
