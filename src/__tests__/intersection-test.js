const babel = require('babel-core');
const content = `
type Props = {
    someProp: {} & {}
};
class MyComponent extends React.Component {
    props: Props;
}
`;

it('intersection', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
