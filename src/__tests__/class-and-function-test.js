const babel = require('babel-core');
const content = `
import React, {Component, PropTypes} from 'react';

type TaskGridHeaderProps = {
    tasksSetSort: any
};

export default class TaskGridHeader extends Component {
    props: TaskGridHeaderProps;

    render() {
        return null;
    }
}

const glyph = (param?: any) => (
    <div/>
);
`;

it('class-and-function', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
