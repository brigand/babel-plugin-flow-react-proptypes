const babel = require('babel-core');
const content = `
const Component = (props: Object) => <div />;
`;

it('object-props', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
