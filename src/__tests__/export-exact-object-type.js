const babel = require('babel-core');
const content = `
// @flow
import React from 'react'
export type VendorProps = {|
  test: string,
|};
`;

it('export-exact-object-type', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
