const babel = require('babel-core');
const content = `
type Props = {
  name: string,
}

var C = (props: Props) => {
  var el = null;
  if (true) {
    el = <div />;
  }
  return el;
};
`;

it('indirect-jsx', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
