const babel = require('babel-core');
const content = `
type FooProps = {
  a_string: 'str',
  a_number: 7,
  a_boolean: true,
  a_null: null,
  a_void: void,
}

class Foo extends Component {
  props: FooProps
  render() { return <div /> }
}
`;

it('literal-type-annotation', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
