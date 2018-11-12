const babel = require('babel-core');
const content = `

type Bar = {
  bar: number
};

class MyComponent extends React.Component {
  props: {
    foo: string
  } & Bar;
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
