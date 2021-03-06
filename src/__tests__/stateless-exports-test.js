const babel = require('babel-core');
const content = `
// @flow
import React from "react";

export const C1 = ({ m } : { m : string }) => {
  return <div />;
};

export const C2 = function({ m } : { m : string }) {
  return <div />;
};
`;

it('stateless-exports', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['@babel/env', '@babel/react', '@babel/flow'],
    plugins: [
      '@babel/syntax-flow',
      require('../'),
      "@babel/plugin-proposal-class-properties"
    ],
  }).code;
  expect(res).toMatchSnapshot();
});
