const babel = require('babel-core');

const run = (content, opts) => () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', [require('../'), opts]]
  }).code;
  expect(res).toMatchSnapshot();
};

it('explicit-prop-types-merge-class-test', run(`
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
`, { mergeExplicitPropTypes: true }));

it('explicit-prop-types-merge-opt-out-test', run(`
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
`, { mergeExplicitPropTypes: false }));

it('explicit-prop-types-merge-stateless-test', run(`
var React = require('react');

type FooProps = {
  a: number,
  b: number,
  c: string,
}

const Foo = (props: FooProps) => {
  return (
    <div>
      {props.a}
      {props.b}
      {props.c}
      {props.d}
    </div>
  );
};

Foo.propTypes = {
  b: PropTypes.string,
  d: PropTypes.string
};

export default Foo;
`, { mergeExplicitPropTypes: true }));

it('explicit-prop-types-merge-no-flow-type-test', run(`
var React = require('react');
var PropTypes = require('prop-types');

const Foo = props => {
  return (
    <div>
      {props.b}
      {props.d}
    </div>
  );
};

Foo.propTypes = {
  b: PropTypes.string,
  d: PropTypes.string
};

export default Foo;
`, { mergeExplicitPropTypes: true }));

it('explicit-prop-types-merge-mixed-static', run(`
var React = require('react');
var PropTypes = require('prop-types');

type FooProps = {
  a: number,
  b: number,
  c: string,
}

class Foo extends React.Component<FooProps> {
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

Foo.propTypes = {
  b: PropTypes.string,
  d: PropTypes.string
};

export default Foo;
`, { mergeExplicitPropTypes: true }));

it('explicit-prop-types-merge-alternate-class-style', run(`
var React = require('react');
var PropTypes = require('prop-types');

type FooProps = {
  a: number,
  b: number,
  c: string,
}

class Foo extends React.Component {
  props: FooProps

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

Foo.propTypes = {
  b: PropTypes.string,
  d: PropTypes.string
};

export default Foo;
`, { mergeExplicitPropTypes: true }));
