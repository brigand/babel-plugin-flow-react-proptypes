const babel = require('babel-core');


const content = `
var React = require('react');

export type T = {
  bar: string,
}

export type U = T & {
  foo: string,
};


class C extends React.Component {
  props: U;
}

export default C;
`;

it('exported-intersection-exported-type-alias-unexported-object-literal', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
