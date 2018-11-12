const babel = require('babel-core');
const content = `
// @flow

import React from 'react';
import type { ExternalType } from '../types';

export type T = {
    flag: boolean,
    list: Array<ExternalType>,
};

const C = ({
    flag,
    list,
}: T) => {
    return flag
        ? <div>yes</div>
        : <Select>
            {list.map((e: ExternalType) => {
                return (
                    <option value={e.id} key={e.id}>
                    </option>
                );
            })}
        </Select>;
};

export default C;
`;

it('import-and-loops', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
