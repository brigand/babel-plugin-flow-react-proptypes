A babel plugin to generate React PropTypes definitions from Flow type declarations.

[![build status](https://img.shields.io/travis/brigand/babel-plugin-flow-react-proptypes/master.svg?style=flat-square)](https://travis-ci.org/brigand/babel-plugin-flow-react-proptypes)
[![npm version](https://img.shields.io/npm/v/babel-plugin-flow-react-proptypes.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-flow-react-proptypes)
[![npm downloads](https://img.shields.io/npm/dm/babel-plugin-flow-react-proptypes.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-flow-react-proptypes)
[![Dependency Status](https://img.shields.io/david/brigand/babel-plugin-flow-react-proptypes.svg?style=flat-square)](https://david-dm.org/brigand/babel-plugin-flow-react-proptypes)

## Example

With this input:

```js
var React = require('react');

type FooProps = {
  an_optional_string?: string,
  a_number: number,
  a_generic_object: Object,
  array_of_strings: Array<string>,
  instance_of_Bar: Bar,
  anything: any,
  one_of: 'QUACK' | 'BARK' | 5,
  onw_of_type: number | string,
  nested_object_level_1: {
    string_property_1: string,
    nested_object_level_2: {
      nested_object_level_3: {
        string_property_3: string,
      },
      string_property_2: string,
    }
  }
}

export default class Foo extends React.Component {
  props: FooProps
}
```

The output will be:

```js
var React = require('react');

var Foo = function (_React$Component) {
  // babel class boilerplate
}(React.Component)

Foo.propTypes = {
  an_optional_string: React.PropTypes.string,
  a_number: React.PropTypes.number.isRequired,
  a_generic_object: React.PropTypes.object.isRequired,
  array_of_strings: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  instance_of_Bar: React.PropTypes.any.isRequired,
  anything: React.PropTypes.any.isRequired,
  one_of: React.PropTypes.oneOf(['QUACK', 'BARK', 5]).isRequired,
  onw_of_type: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired,
  nested_object_level_1: React.PropTypes.shape({
    string_property_1: React.PropTypes.string.isRequired,
    nested_object_level_2: React.PropTypes.shape({
      nested_object_level_3: React.PropTypes.shape({
        string_property_3: React.PropTypes.string.isRequired
      }).isRequired,
      string_property_2: React.PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

exports.default = Foo;
```

## Usage

This plugin searches for a React components using type declaration. Works with functional components, `React.createClass` and ES6 classes.


## Install

First install the plugin:

```sh
npm install --save-dev babel-plugin-flow-react-proptypes
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


