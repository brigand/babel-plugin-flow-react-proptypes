const babel = require('babel-core');


const content = `
var React = require('react');

import type {NamedType} from "./types";

export type X = NamedType & { a: string };

class D extends React.Component {
   props: X & {c: string};
};

export default D;
`;

it('intersection-exported-type-alias-unexported-object-literal', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
