const babel = require('babel-core');
const content = `
var React = require('react');

type Props = {
  /** foo comment */
  foo: string,

  // bar comment
  bar: string,

  baz: {
    // subbar comment
    subbar: number,
  },
};

const C = (props: Props) => {
  return <div />;
};

export default C;
`;

it('preserve-comments', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
