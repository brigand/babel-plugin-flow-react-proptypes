const babel = require('babel-core');
const content = `
type Empty = {
    [key: string]: empty,
};
`;

it('empty', () => {
  expect(() => babel.transform(content, {
    babelrc: false,
    presets: ['@babel/env', '@babel/react', '@babel/flow'],
    plugins: [
      '@babel/syntax-flow',
      require('../'),
      "@babel/plugin-proposal-class-properties"
    ],
  }).code).not.toThrow();
});
