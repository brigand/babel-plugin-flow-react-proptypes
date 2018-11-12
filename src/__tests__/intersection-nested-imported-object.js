const babel = require('babel-core');
const content = `
import type {NamedType} from './foo';

type FooProps = {
  foo: string,
  bar: number,
  baz: {foo: number} & NamedType,
};

class C extends React.Component {
    props: FooProps
}
`;

it('intersection-nested-with-imported-object', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
