const name = process.argv[2];

if (!name || /[^A-Za-z0-9-]/.test(name)) {
  console.error(`Test name "${name}" is invalid`);
  console.error(`May only contain letters, numbers, an hyphens`);
  process.exit(7);
}

const code = `
const babel = require('babel-core');
const content = \`
var React = require('react');

\`;

it('${name}', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
`.trim();

const fs = require('fs');
const file = `src/__tests__/${name}-test.js`;
fs.writeFileSync(file, code);
console.error(`Wrote file:`);
console.log(file);

