const babel = require('babel-core');
const content = `

// @flow

export default function(
  url: string,
  options: PhenomicStaticConfig,
  Html: Function = DefaultHtml
): Promise<string> {

  return <div/>;
}


`;

it('issue 66', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
