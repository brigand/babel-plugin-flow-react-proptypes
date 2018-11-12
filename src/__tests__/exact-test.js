const babel = require('babel-core');
const content = `
type FooProps = {
  bar: $Exact<{
    a: string,
    b: number,
  }>
};

class Foo extends React.Component {
  props: FooProps;

  render() { return <div /> }
};
`;

it('exact', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
