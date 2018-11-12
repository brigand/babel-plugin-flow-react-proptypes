const babel = require('babel-core');
const content = `

export type ExportedType = {
  bar: number,
};

class MyComponent extends React.Component {
  props: {
    foo: string
  } & ExportedType;
}
`;

it('intersection inline with exported type', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
