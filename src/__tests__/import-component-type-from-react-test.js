const babel = require('babel-core');
const content = `
import React from 'react';
import type { ComponentType } from 'react';

type Props = {
    component?: string | ComponentType<*>,
}

class C extends React.Component<any, Props> {
}

`;

it('import-component-type-from-react', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
