const babel = require('babel-core');
const content = `
var React = require('react');

type TypeReference = { b: number };
interface Interface {
  x: number,
  y?: string,
}

opaque type StringAlias = string;
opaque type StringConstraintAlias: string = string;
opaque type NumberAlias = number;
opaque type TypeAlias = { a: string, b?: boolean };
opaque type TypeReferenceAlias = TypeReference;
opaque type InterfaceReferenceAlias = Interface;

type T = {
  stringAlias: StringAlias,
  optionalStringAlias?: StringAlias,
  stringAliasConstraint: StringConstraintAlias,
  numberAlias: NumberAlias,
  typeAlias: TypeAlias,
  typeReferenceAlias: TypeReference,
  interfaceReferenceAlias: InterfaceReferenceAlias,
}

export default class C extends React.Component {
  props: T
}
`;

it('opaque-type-alias', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
