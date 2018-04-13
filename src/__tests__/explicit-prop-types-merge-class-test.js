const babel = require('babel-core');
const content = `
var React = require('react');
var PropTypes = require('prop-types');

type FooProps = {
  a: number,
  b: number,
  c: string,
}

export default class Foo extends React.Component<FooProps> {
  static propTypes = {
    b: PropTypes.string,
    d: PropTypes.string
  }

  render() {
    return (
      <div>
        {this.props.a}
        {this.props.b}
        {this.props.c}
        {this.props.d}
      </div>
    );
  }
}
`;

it('explicit-prop-types-merge-class-test', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
