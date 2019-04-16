const babel = require('babel-core');
const content = `
import * as React from "react";

import type {RowProps} from "./other-row.jsx";

type StaticProps = RowProps & {
    domain: string,
};

class TableOfContentsRow extends React.Component<StaticProps> {
    render() {
        return <div>I'm a row</div>;
    }
}

export default class TableOfContentsRowWithQuery extends React.Component<StaticProps> {
    render() {
        return <TableOfContentsRow/>;
    }
}
`;

it('import-object', () => {
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
