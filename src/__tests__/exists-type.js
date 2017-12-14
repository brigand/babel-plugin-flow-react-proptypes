const babel = require('babel-core');
const content = `
type Props = {
  x?: *,
  y: *,
};
class Foo extends React.Component {
  props: Props;

  render() { return <div /> }
};
`;

it('existsType', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
