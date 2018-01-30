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

var babelPluginFlowReactPropTypes_proptype_Qux = {
  baz: bpfrp_PropTypes.oneOf(['literal']).isRequired
};


export default class Foo extends React.Component {}
Foo.propTypes = {
  an_optional_string: bpfrp_PropTypes.string,
  a_number: bpfrp_PropTypes.number.isRequired,
  a_boolean: bpfrp_PropTypes.bool.isRequired,
  a_generic_object: bpfrp_PropTypes.object.isRequired,
  array_of_strings: bpfrp_PropTypes.arrayOf(bpfrp_PropTypes.string).isRequired,
  instance_of_Bar: function () {
    return (typeof Bar === 'function' ? bpfrp_PropTypes.instanceOf(Bar).isRequired : bpfrp_PropTypes.any.isRequired).apply(this, arguments);
  },
  anything: (props, propName, componentName) => {
    if (!Object.prototype.hasOwnProperty.call(props, propName)) {
      throw new Error(`Prop \`${propName}\` has type 'any' or 'mixed', but was not provided to \`${componentName}\`. Pass undefined or any other value.`);
    }
  },
  mixed: (props, propName, componentName) => {
    if (!Object.prototype.hasOwnProperty.call(props, propName)) {
      throw new Error(`Prop \`${propName}\` has type 'any' or 'mixed', but was not provided to \`${componentName}\`. Pass undefined or any other value.`);
    }
  },
  one_of: bpfrp_PropTypes.oneOf(['QUACK', 'BARK', 5]).isRequired,
  one_of_type: bpfrp_PropTypes.oneOfType([bpfrp_PropTypes.number, bpfrp_PropTypes.string]).isRequired,
  nested_object_level_1: bpfrp_PropTypes.shape({
    string_property_1: bpfrp_PropTypes.string.isRequired,
    nested_object_level_2: bpfrp_PropTypes.shape({
      nested_object_level_3: bpfrp_PropTypes.shape({
        string_property_3: bpfrp_PropTypes.string.isRequired
      }).isRequired,
      string_property_2: bpfrp_PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  should_error_if_provided: (props, propName, componentName) => {
    if (props[propName] != null) {
      throw new Error(`Invalid prop \`${propName}\` of value \`${props[propName]}\` passed to \`${componentName}\`. Expected undefined or null.`);
    }
  },
  intersection: bpfrp_PropTypes.shape({
    foo: bpfrp_PropTypes.string.isRequired,
    bar: bpfrp_PropTypes.number.isRequired,
    baz: bpfrp_PropTypes.oneOf(['literal']).isRequired
  }).isRequired,
  some_external_type: function () {
    return (typeof bpfrp_babelPluginFlowReactPropTypes_proptype_SomeExternalType === 'function' ? bpfrp_babelPluginFlowReactPropTypes_proptype_SomeExternalType.isRequired ? bpfrp_babelPluginFlowReactPropTypes_proptype_SomeExternalType.isRequired : bpfrp_babelPluginFlowReactPropTypes_proptype_SomeExternalType : bpfrp_PropTypes.shape(bpfrp_babelPluginFlowReactPropTypes_proptype_SomeExternalType).isRequired).apply(this, arguments);
  },
  some_external_type_intersection: bpfrp_PropTypes.shape(Object.assign({}, {
    foo: bpfrp_PropTypes.string.isRequired
  }, bpfrp_babelPluginFlowReactPropTypes_proptype_SomeExternalType === bpfrp_PropTypes.any ? {} : bpfrp_babelPluginFlowReactPropTypes_proptype_SomeExternalType)).isRequired
};
import bpfrp_PropTypes from 'prop-types';
export { babelPluginFlowReactPropTypes_proptype_Qux };
import { bpfrp_babelPluginFlowReactPropTypes_proptype_SomeExternalType } from './types';
```

## Versions

Starting in 14.0.0, we output ES6 import/export statements by default. The `deadCode` option (explained below) will cause it to use common.js modules instead.

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

## deadCode

The `deadCode` option (disabled by default) adds a predicate to the code allowing both your propTypes definitions and potentially the
entire 'prop-types' package to be excluded in certain builds. Unlike specifying this plugin in the development env, mentioned above,
this also works for packages published to npm.

```json
  "plugins": [["flow-react-proptypes", { "deadCode": true }]]
```

The value of `true` is short for `process.env.NODE_ENV === 'production'`. You can alternatively pass any JavaScript expression. If the expression
returns a truthy value, then the propTypes will be removed. This works because e.g. webpack will subsitute the value of `process.env.NODE_ENV` with `'production'`, resulting in the condition being `'production' === 'production'`, and then a minifer sees that the code we're generating can't be executed, and strips it, and the `require('prop-types')` code out of the final bundle.

**Note:** In dead code mode, we use `require/module.exports` instead of ES6 modules.

Example of specifying a custom expression:

```json
  "plugins": [["flow-react-proptypes", { "deadCode": "__PROD__" }]]
```

## useESModules

The `useESModules` forces esm with enabled `deadCode` which wraps prop types with condition, but do not remove import/export statement in favor of your favorite bundle.

## Suppression
This plugin isn't perfect. You can disable it for an entire file with this directive (including quotes):

```js
'no babel-plugin-flow-react-proptypes';
```

Specifically for react-native you can disable this for files in `node_modules` with the `ignoreNodeModules` config option.

```json
{
  "presets": ["..."],
  "plugins": [["flow-react-proptypes", { "ignoreNodeModules": true }]]
}
```

If you already have other plugins in plugins section. It is important to place
`flow-react-proptypes` before the following plugins:

- `transform-class-properties`
- `transform-flow-strip-types`

If you're using the 'react' or 'flow' presets, you don't need to do anything special.

