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
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
