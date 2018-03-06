const babel = require('babel-core');

const run = (content, opts) => () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', [require('../'), opts]]
  }).code;
  expect(res).toMatchSnapshot();
};

it('optional-default-props-class-test', run(`
var React = require('react');
var PropTypes = require('prop-types');

type FooProps = {
  a: number,
  b: number,
  c: string,
}

class Foo extends React.Component<FooProps> {
  static defaultProps = {
    a: 7
  }

  render() {
    return (
      <div>
        {this.props.a}
        {this.props.b}
        {this.props.c}
      </div>
    );
  }
}

export default Foo;
`, { defaultPropsOptional: true }));

it('optional-default-props-stateless-test', run(`
var React = require('react');
var PropTypes = require('prop-types');

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
    </div>
  );
}

Foo.defaultProps = {
  a: 7
};

export default Foo;
`, { defaultPropsOptional: true }));

it('optional-default-props-mixed', run(`
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
      </div>
    );
  }
}

Foo.defaultProps = {
  a: 7
};

export default Foo;
`, { defaultPropsOptional: true }));

it('optional-default-props-class-merge-test', run(`
var React = require('react');
var PropTypes = require('prop-types');

type FooProps = {
  a: number,
  b: number,
  c: string,
}

class Foo extends React.Component<FooProps> {
  static defaultProps = {
    a: 7
  }

  static propTypes = {
    a: PropTypes.string
  }

  render() {
    return (
      <div>
        {this.props.a}
        {this.props.b}
        {this.props.c}
      </div>
    );
  }
}

export default Foo;
`, { defaultPropsOptional: true, mergeExplicitPropTypes: true }));

it('optional-default-props-opt-out-test', run(`
var React = require('react');
var PropTypes = require('prop-types');

type FooProps = {
  a: number,
  b: number,
  c: string,
}

class Foo extends React.Component<FooProps> {
  static defaultProps = {
    a: 7
  }

  render() {
    return (
      <div>
        {this.props.a}
        {this.props.b}
        {this.props.c}
      </div>
    );
  }
}

export default Foo;
`, { defaultPropsOptional: false }));
