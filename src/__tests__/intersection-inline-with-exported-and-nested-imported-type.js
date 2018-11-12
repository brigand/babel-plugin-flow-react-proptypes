const babel = require('babel-core');
const content = `

import type {NamedType} from "./types";

export type ExportedType = {
  bar: number,
};

class MyComponent extends React.Component {
  props: {
    foo: string,
    baz: NamedType,
  } & ExportedType;
}
`;

it('intersection inline with exported and nested imported type', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
