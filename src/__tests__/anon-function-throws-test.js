const babel = require('babel-core');
const content = `
type Props = {
  x: string,
};
export default function(props: Props) {
  return <div />;
}
`;

it('anon-function-throws', () => {
  expect(() => {
    babel.transform(content, {
      babelrc: false,
      presets: ['env', 'stage-1', 'react'],
      plugins: ['syntax-flow', require('../')],
    });
  }).toThrow(/with no name/);
});
