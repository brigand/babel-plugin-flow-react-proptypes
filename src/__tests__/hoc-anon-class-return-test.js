const babel = require('babel-core');
const content = `
type FooProps = {
  a_prop: boolean,
};

export default () => {
  return class extends React.Component {
    props: FooProps;
  }
};
`;

it('hoc-handles-anon-class-return', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
