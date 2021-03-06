const babel = require('babel-core');
const content = `
import React, {Component, PropTypes} from 'react';

type TaskGridHeaderProps = {
    tasksSetSort: any
};

type State = {
  x: string,
};

export default class TaskGridHeader extends Component<TaskGridHeaderProps,State> {
    render() {
        return null;
    }
}
`;

it('flow-53-generic', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['@babel/env', '@babel/react', '@babel/flow'],
    plugins: [
      '@babel/syntax-flow',
      require('../'),
      "@babel/plugin-proposal-class-properties"
    ],
  }).code;
  expect(res).toMatchSnapshot();
});
