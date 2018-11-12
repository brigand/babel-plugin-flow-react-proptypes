const babel = require('babel-core');
const content = `
var React = require('react');

export type U = {bar: string} & {foo: string};

class C extends React.Component {
  props: U;
}

export default C;
`;

it('interesection-two-object-type-literals', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
