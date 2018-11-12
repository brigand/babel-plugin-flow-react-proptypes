const babel = require('babel-core');
const content = `
var React = require('react');

export default class Foo extends React.Component<{a_number: number}> {
}
`;

it('inline-type-param-158', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatch(/propTypes/);
  expect(res).toMatchSnapshot();
});
