A babel plugin to generate React PropTypes definitions from Flow type declarations.

[![build status](https://img.shields.io/travis/brigand/babel-plugin-flow-react-proptypes/master.svg?style=flat-square)](https://travis-ci.org/brigand/babel-plugin-flow-react-proptypes)
[![Coverage Status](https://coveralls.io/repos/github/brigand/babel-plugin-flow-react-proptypes/badge.svg?branch=master)](https://coveralls.io/github/brigand/babel-plugin-flow-react-proptypes?branch=master)
[![npm version](https://img.shields.io/npm/v/babel-plugin-flow-react-proptypes.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-flow-react-proptypes)
[![npm downloads](https://img.shields.io/npm/dm/babel-plugin-flow-react-proptypes.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-flow-react-proptypes)
[![Dependency Status](https://img.shields.io/david/brigand/babel-plugin-flow-react-proptypes.svg?style=flat-square)](https://david-dm.org/brigand/babel-plugin-flow-react-proptypes)

## Example

With this input:

```js
var React = require('react');

export type Qux = {baz: 'literal'};

import type SomeExternalType from './types';

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
  should_error_if_provided: void,
  intersection: {foo: string} & { bar: number } & Qux,
  some_external_type: SomeExternalType,
  some_external_type_intersection: {foo: string} & SomeExternalType,
}

export default class Foo extends React.Component {
  props: FooProps
}}
```

The output will be:

```js
var React = require('react');

if (typeof exports !== 'undefined')
  Object.defineProperty(exports, 'babelPluginFlowReactPropTypes_proptype_Qux', {
    value: {
      baz: require('prop-types').oneOf(['literal']).isRequired,
    },
  });

var babelPluginFlowReactPropTypes_proptype_SomeExternalType = require('./types').babelPluginFlowReactPropTypes_proptype_SomeExternalType ||
  require('prop-types').any;

var Foo = (function(_React$Component) {
  // babel class boilerplate
})(React.Component);

Foo.propTypes = {
  an_optional_string: require('prop-types').string,
  a_number: require('prop-types').number.isRequired,
  a_boolean: require('prop-types').bool.isRequired,
  a_generic_object: require('prop-types').object.isRequired,
  array_of_strings: require('prop-types').arrayOf(require('prop-types').string).isRequired,
  instance_of_Bar: typeof Bar === 'function'
    ? require('prop-types').instanceOf(Bar).isRequired
    : require('prop-types').any.isRequired,
  anything: require('prop-types').any.isRequired,
  mixed: require('prop-types').any.isRequired,
  one_of: require('prop-types').oneOf(['QUACK', 'BARK', 5]).isRequired,
  one_of_type: require('prop-types').oneOfType([require('prop-types').number, require('prop-types').string]).isRequired,
  nested_object_level_1: require('prop-types').shape({
    string_property_1: require('prop-types').string.isRequired,
    nested_object_level_2: require('prop-types').shape({
      nested_object_level_3: require('prop-types').shape({
        string_property_3: require('prop-types').string.isRequired,
      }).isRequired,
      string_property_2: require('prop-types').string.isRequired,
    }).isRequired,
  }).isRequired,
  should_error_if_provided: function should_error_if_provided(props, propName, componentName) {
    if (props[propName] != null)
      return new Error(
        'Invalid prop `' +
          propName +
          '` of value `' +
          value +
          '` passed to `' +
          componentName +
          '`. Expected undefined or null.'
      );
  },
  intersection: require('prop-types').shape({
    foo: require('prop-types').string.isRequired,
    bar: require('prop-types').number.isRequired,
    baz: require('prop-types').oneOf(['literal']).isRequired,
  }).isRequired,
  some_external_type: typeof babelPluginFlowReactPropTypes_proptype_SomeExternalType === 'function'
    ? babelPluginFlowReactPropTypes_proptype_SomeExternalType
    : require('prop-types').shape(babelPluginFlowReactPropTypes_proptype_SomeExternalType).isRequired,
  some_external_type_intersection: require('prop-types').shape(
    Object.assign(
      {},
      {foo: require('prop-types').string.isRequired,},
      babelPluginFlowReactPropTypes_proptype_SomeExternalType === require('prop-types').any
        ? {}
        : babelPluginFlowReactPropTypes_proptype_SomeExternalType
    )
  ).isRequired,
};
exports.default = Foo;
```

## Usage

This plugin searches for a React components using type declaration. Works with functional components and ES6 classes. `React.createClass` is not currently supported.


## Install

First install the plugin:

```sh
npm install --save-dev babel-plugin-flow-react-proptypes
```

Also install the prop-types package. This is required for React `>=15.5.0`. For earlier React versions
you can use version `0.21.0` of this plugin, which doesn't use the prop-types package.

```sh
npm install --save prop-types
```

Then add it to your babelrc:

```json
{
  "presets": ["..."],
  "plugins": ["flow-react-proptypes"]
}
```

To save some bytes in production, you can also only enable it in development mode.

```json
{
  "presets": ["..."],
  "env": {
    "development": {
      "plugins": ["flow-react-proptypes"]
    }
  }
}
```

## Suppression
This plugin isn't perfect. You can disable it for an entire file with this directive (including quotes):

```js
'no babel-plugin-flow-react-proptypes';
```

Specifically for react-native you can disable this for files in `node_modules` with the `ignoreNodeModules` config option.

```json
{
  "presets": ["..."],
  "plugins": [["flow-react-proptypes", {"ignoreNodeModules": true}]]
}
```

If you already have other plugins in plugins section. It is important to place
`flow-react-proptypes` before the following plugins:

- `transform-class-properties`
- `transform-flow-strip-types`

If you're using the 'react' or 'flow' presets, you don't need to do anything special.

## Minimizing production bundle size
In production, omitting props and minimizing bundle size can be done with the additon of two things:
1. Add the [transform-react-remove-prop-types](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types) plugin
2. Omit exported types to allow for dead code pruning

There are cases where a library wishes to `export type` making types available in `*.js.flow` shadow files,
but these may have no other purpose during runtime.  If you wish to omit the corresponding export of
the generated flow types, using this option with the
[transform-react-remove-prop-types](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types)
plugin will allow for the smallest production bundle size.

An example snippet from a `.babelrc`:
```json
"production": {
  "plugins": [
    ["transform-react-remove-prop-types", {
      "mode": "wrap",
      "plugins": [
        ["babel-plugin-flow-react-proptypes", {"omitRuntimeTypeExport": true}],
        "babel-plugin-transform-flow-strip-types",
      ]
    }]
  ]
}
```
