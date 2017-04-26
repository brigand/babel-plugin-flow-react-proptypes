const babel = require('babel-core');
const content = `
export appcache from "./validators/appcache.js"
export assets from "./validators/assets.js"
export baseUrl from "./validators/baseUrl.js"
export production from "./validators/production.js"
`;

it('just-exports', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
