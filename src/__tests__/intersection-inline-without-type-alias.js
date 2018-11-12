const babel = require('babel-core');
const content = `

class MyComponent extends React.Component {
  props: {
    foo: string
  } & {
    bar: number
  };
}
`;

it('intersection inline without type alias', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
