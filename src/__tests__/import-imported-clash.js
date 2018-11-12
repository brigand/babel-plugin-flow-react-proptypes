const babel = require('babel-core');
const content = `
import type {Foo} from './foo';
import type {Foo as Bar} from './bar';

type Props = {
  foo: Foo,
  bar: Bar,
};

class C extends React.Component {
    props: Props
};
`;

it('import-imported-clash', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
