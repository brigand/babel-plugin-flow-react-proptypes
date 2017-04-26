// http://sitr.us/2015/05/31/advanced-features-in-flow.html#existential-types
const babel = require('babel-core');
const content = `
type FooProps = {
  bar: *
}

const C = (props: FooProps) : ReactElement => {
}
`;

it('function-with-type-annotation', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
