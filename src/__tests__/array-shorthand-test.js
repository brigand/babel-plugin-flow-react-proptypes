const babel = require('babel-core');
const content = `
type CProps = {
  as: string[]
}

export default class C extends React.Component {
  props: CProps;
  render() {
    return <div />;
  }
}
`;

it('array-shorthand', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
