const babel = require('babel-core');
const content = `
var React = require('react');
var PropTypes = require('prop-types');

type Foo = {
  from_foo_type: string,
}

const stuff = {
  stuff_prop_types: PropTypes.string,
}

class C extends React.Component {
  static propTypes = {
    ...stuff,
    from_prop_types: PropTypes.string,
  }
  props: {
    ...Foo,
    from_type: string,
  };
  render() { return <div /> }
}

`;

it('spread-top-level-props', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
