const babel = require('babel-core');
const content = `
var React = require('react');

type FooProps = {
  a_number: number,
}

export default class Foo extends React.Component<FooProps> {
}
`;

it('class-single-type-test', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});

const contentB = `
var React = require('react');

type FooProps = {
  a_number: number,
}

export default class extends React.Component<FooProps> {
}
`;

it('class-single-type-anon-test', () => {
  const res = babel.transform(contentB, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
