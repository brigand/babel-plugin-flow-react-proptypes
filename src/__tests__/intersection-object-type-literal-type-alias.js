const babel = require('babel-core');
const content = `
var React = require('react');

type T = {foo: string};;

type U = {bar: string} & T;

class C extends React.Component {
  props: U;
}

export default C;
`;

it('intersection-object-type-literal-type-alias', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
