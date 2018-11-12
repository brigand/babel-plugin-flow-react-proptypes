const babel = require('babel-core');
const content = `
// @flow
import type { Node } from 'react';

type Props = {
  foo: Node,
}

const C = (props: Props) => <div />;
`;

it('import-named-react-node', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatch(/_propTypes2\.default\.node/);
  expect(res).toMatchSnapshot();
});

it('import-named-react-node esm', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: [['env', { modules: false }], 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatch(/PropTypes\.node/);
  expect(res).toMatchSnapshot();
});
