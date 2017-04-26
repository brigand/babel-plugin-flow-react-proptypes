const babel = require('babel-core');
const content = `
var React = require('react');

type FooProps = {
  an_optional_string?: string,
  a_number: number,
  a_boolean: boolean,
  a_generic_object: Object,
  array_of_strings: Array<string>,
  instance_of_Bar: Bar,
  anything: any,
  mixed: mixed,
  one_of: 'QUACK' | 'BARK' | 5,
  one_of_type: number | string,
  nested_object_level_1: {
    string_property_1: string,
    nested_object_level_2: {
      nested_object_level_3: {
        string_property_3: string,
      },
      string_property_2: string,
    }
  },
  should_error_if_provided: void
}

export default class Foo extends React.Component {
  props: FooProps
}
`;

it('basic', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
