const babel = require('babel-core');
const content = `
type FooProps = {
  name: string,
}

const C = (props: FooProps) : ReactElement<*> => {
}
`;

it('function-with-generic-type-annotation', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['@babel/env', '@babel/react', '@babel/flow'],
    plugins: [
      '@babel/syntax-flow',
      require('../'),
      "@babel/plugin-proposal-class-properties"
    ],
  }).code;
  expect(res).toMatchSnapshot();
});
