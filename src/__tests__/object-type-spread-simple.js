const babel = require('babel-core');
const content = `
type A = {
    foo: string
}
type Props = {
    bar: string,
    ...A
};
class MyComponent extends React.Component {
    props: Props;
}
`;

it('object-type-spread-simple', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
