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

class Foo extends React.Component {
  context: FooC;

  render() {
    return <div />;
  }
};

export default Foo;
`;

it('allows class components with context and no props', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
