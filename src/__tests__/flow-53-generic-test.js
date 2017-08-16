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
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
