const babel = require('babel-core');
const content = `
import type { Foo, Bar } from './response-form'
export type { Foo, Bar }
`;

it('import-then-export', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: [['env', { modules: false }], 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatch(/import\s*\{\s*bpfrpt_proptype_Foo\s*}/);
  expect(res).toMatch(/import\s*\{\s*bpfrpt_proptype_Bar\s*}/);
  expect(res).toMatch(/export\s*\{\s*bpfrpt_proptype_Foo\s*}/);
  expect(res).toMatch(/export\s*\{\s*bpfrpt_proptype_Bar\s*}/);
  expect(res).toMatchSnapshot();
});

it('import-then-export with deadCode', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: [['env', { modules: false }], 'stage-1', 'react'],
    plugins: ['syntax-flow', [require('../'), { deadCode: true }]],
  }).code;
  expect(res).toMatch(/exports,\s*'bpfrpt_proptype_Foo\b/);
  expect(res).toMatch(/value[^,]+require.*response-form[^,]*bpfrpt_proptype_Foo/);
  expect(res).toMatch(/exports,\s*'bpfrpt_proptype_Bar\b/);
  expect(res).toMatch(/value[^,]+require.*response-form[^,]*bpfrpt_proptype_Bar/);
  expect(res).toMatchSnapshot();
});

