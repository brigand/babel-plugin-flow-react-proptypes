A babel plugin to generate React PropTypes definitions from Flow type declarations. Try it out on [astexplorer][astexp]!

[astexp]: http://astexplorer.net/#/YzN9Yq2vLH/4

## Example

With this input:

```js
var React = require('react');

type FooProps = {
  an_optional_string?: string,
  a_number: number,
  a_generic_object: object,
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
  a_generic_object: React.PropTypes.any.isRequired,
  array_of_strings: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  instance_of_Bar: React.PropTypes.instanceOf(Bar).isRequired,
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

This plugin searches for a type declaration (`type FooProps = {...}`) that has a name containing 'Props'.

It then searches for a class declaration, and it attaches a `propTypes` property to the class.

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
