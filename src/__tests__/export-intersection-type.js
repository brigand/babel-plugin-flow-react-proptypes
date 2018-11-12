const babel = require('babel-core');
const content = `
var React = require('react');

type T = {
  bar: string,
}

type U = {
  foo: string,
}

export type V = U & T;


class C extends React.Component {
  props: V;
}

export default C;
`;

it('export-intersection-type', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
