const babel = require('babel-core');
const content = `
var React = require('react');

type Complex = {
  imag: number;
  real: number;
}
type FooProps = {
  arrayAnnotationOfNumbers: number[];
  genericArrayOfNumbers: Array<number>;
  objectOfNumbers: {[name: string]: number};

  arrayAnnotationOfOptionalNumbers: (?number)[];
  genericArrayOfOptionalNumbers: Array<?number>;
  objectOfOptionalNumbers: {[name: string]: ?number};

  optionalArrayAnnotationOfNumbers: ?number[];
  optionalGenericArrayOfNumbers: ?Array<number>;
  optionalObjectOfNumbers: ?{[name: string]: number};

  optionalArrayAnnotationOfOptionalNumbers: ?(?number)[];
  optionalGenericArrayOfOptionalNumbers: ?Array<?number>;
  optionalObjectOfOptionalNumbers: ?{[name: string]: ?number};

  arrayAnnotationOfComplexes: Complex[];
  genericArrayOfComplexes: Array<Complex>;
  objectOfComplexes: {[name: string]: Complex};

  arrayAnnotationOfOptionalComplexes: (?Complex)[];
  genericArrayOfOptionalComplexes: Array<?Complex>;
  objectOfOptionalComplexes: {[name: string]: ?Complex};

  optionalArrayAnnotationOfComplexes: ?Complex[];
  optionalGenericArrayOfComplexes: ?Array<Complex>;
  optionalObjectOfComplexes: ?{[name: string]: Complex};

  optionalArrayAnnotationOfOptionalComplexes: ?(?Complex)[];
  optionalGenericArrayOfOptionalComplexes: ?Array<?Complex>;
  optionalObjectOfOptionalComplexes: ?{[name: string]: ?Complex};
}

export default class Foo extends React.Component {
  props: FooProps
}
`;

it('objectOf', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
