const babel = require('babel-core');
const content = `
var React = require('react');

type Choices = 'option1' | 'option2';

type FooT = {
    x?: Choices
};

type FooC = {
    lang: string,
};

class Foo extends React.Component<void, FooT, FooC> {
  render() {
    return <div />;
  }
};

export default Foo;
`;

it('allows specifying both props and context via parameters', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
