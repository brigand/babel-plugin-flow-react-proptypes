const babel = require('babel-core');
const content = `
import type {NamedType} from './foo';
import type {SomeOtherType} from './bar';

type FooProps = NamedType & SomeOtherType;

class C extends React.Component {
    props: FooProps
}
`;

it('intersection-with-only-imported-objects', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
