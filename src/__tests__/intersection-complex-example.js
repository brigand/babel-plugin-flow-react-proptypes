const babel = require('babel-core');


const content = `
var React = require('react');

import type {NamedType} from "./types";
import type DefaultType from "./types";

export type T = {
  foo: string,
}

export type U = {
  bar: number,
}

export type X = NamedType &
  { a: NamedType, b: string} &
  DefaultType & U & T;

type V = {
  qux: string,
  quy: T & NamedType & {XXX: string, YYY: NamedType & { ZZZ: number}},
  quz: U & DefaultType
} & U & T;


class C extends React.Component {
  props: V;
}

class D extends React.Component {
   props: {c: string, b: NamedType } & X;
}

export default C;
`;

it('intersection-exported-type-alias-unexported-object-literal', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
