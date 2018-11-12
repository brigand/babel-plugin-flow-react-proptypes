const babel = require('babel-core');
const content = `

export type Fact = Foo.Bar;
export type FactMap = Foo.Map<string, string>;

import {SomeClass} from './some_class';

class MyComponent extends React.Component {
    props: {
      some_class: SomeClass.property,
      generics: SomeClass.Map<string, string>,
      deep: SomeClass.deeper.nesting.Bar,
    }
}
`;

it('instance-of', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
