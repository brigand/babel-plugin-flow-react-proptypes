const babel = require('babel-core');
const content = `

import type {NamedType} from "./types";

class MyComponent extends React.Component {
  props: {
    foo: string
  } & NamedType;
}
`;

it('intersection inline with imported type', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
