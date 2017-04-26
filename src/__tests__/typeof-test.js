const babel = require('babel-core');
const content = `
const ActionTypes = {
  JUMP_TO: 'react-native/NavigationExperimental/tabs-jumpTo',
};

export type JumpToAction = {
  type: typeof ActionTypes.JUMP_TO,
  index: number,
};
`;

it('typeof', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
