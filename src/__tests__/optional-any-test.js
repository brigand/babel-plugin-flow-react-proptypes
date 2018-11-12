const babel = require('babel-core');
const content = `
import React from 'react';

type Props = {
  requiredAny: any,
  optionalAny?: any,
};

const Foo = (props: Props) => <div />
export default Foo
`;

it('optional-any', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
