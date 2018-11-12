module.exports.transform = (someString) => {
  const babel = require('babel-core');

  const babelOpts = {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../../')],
  };
  return babel.transform(someString, babelOpts).code;
};


module.exports.transpileIncludes = (includes) => {
  const fs = require('fs');
  includes.forEach(([inFile, outFile]) => {
    const inFileContent = fs.readFileSync(inFile);

    const outFileContent = module.exports.transform(inFileContent);
    fs.writeFileSync(outFile, outFileContent);
  });
};

module.exports.getConsoleErrorsForComponent = (sourceCode, includes) => {
  module.exports.transpileIncludes(includes);
  const mockConsoleError = jest.fn();
  const consoleError = console.error;
  console.error = mockConsoleError;
  const transpiled = module.exports.transform(sourceCode);
  eval(transpiled);
  console.error = consoleError;
  const errorsSeen = mockConsoleError.mock.calls;
  return errorsSeen;
};
