const babel = require('babel-core');
const content = `
var React = require('react');

type FooProps = {
  problem: {[name: string]: number, [nombre: string]: bool},
}

export default class Foo extends React.Component {
  props: FooProps
}
`;

it('objectOf rejects multiple indexers', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatch(/object/);
  expect(res).not.toMatch(/objectOf/);
});
