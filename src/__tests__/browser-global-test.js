const babel = require('babel-core');
const content = `
const Element = window.Element;

type FooProps = {
  element: Element,
}

class Foo extends React.Component {
  props: FooProps;

  render() { return null; }
}

`;

it('global element', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
