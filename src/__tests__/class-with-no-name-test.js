const babel = require('babel-core');
const content = `
import * as React from 'react'

type Props = {
  children: React.Node
}

export const MyComponent = class extends React.Component<Props> {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}
`;

it('class-with-no-name', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatch(/node.isRequired/);
  expect(res).toMatchSnapshot();
});
