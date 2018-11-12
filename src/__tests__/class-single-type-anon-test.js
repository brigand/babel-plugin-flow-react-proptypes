const babel = require('babel-core');
const content = `
var React = require('react');

type FooProps = {
  a_number: number,
}

export default class extends React.Component<FooProps> {
}
`;

it('class-single-type-anon-test', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
