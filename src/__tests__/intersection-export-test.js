const babel = require('babel-core');
const content = `
var React = require('react');

import type T from './T';

export type U = T & {
  foo: string,
};

type V = {
  baz: string,
};

class C extends React.Component {
  props: U;
}

export default C;
`;

it('interesection-export', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
