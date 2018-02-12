const babel = require('babel-core');
const content = `
// @flow
import type { Job } from 'JLCommon';
export type JobViewImpression = Job & {
    resultId?: string,
    listIndex: number,
    searchType: ?string,
    viewSource: ?string,
};
`;

it('real3', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
