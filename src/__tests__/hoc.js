const babel = require('babel-core');
const content = `
type FooProps = {
  a_prop: boolean,
};

export default () => {
  class C extends React.Component {
    props: FooProps;
  }
  return C;
};
`;

it('import-object', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
