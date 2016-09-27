'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var Foo = function (_React$Component) {
  _inherits(Foo, _React$Component);

  function Foo() {
    _classCallCheck(this, Foo);

    return _possibleConstructorReturn(this, (Foo.__proto__ || Object.getPrototypeOf(Foo)).apply(this, arguments));
  }

  return Foo;
}(React.Component);

Foo.propTypes = {
  an_optional_string: require('react').PropTypes.string,
  a_number: require('react').PropTypes.number.isRequired,
  a_boolean: require('react').PropTypes.bool.isRequired,
  a_generic_object: require('react').PropTypes.object.isRequired,
  array_of_strings: require('react').PropTypes.arrayOf(require('react').PropTypes.string).isRequired,
  instance_of_Bar: require('react').PropTypes.any.isRequired,
  anything: require('react').PropTypes.any.isRequired,
  mixed: require('react').PropTypes.any.isRequired,
  one_of: require('react').PropTypes.oneOf(['QUACK', 'BARK', 5]).isRequired,
  one_of_type: require('react').PropTypes.oneOfType([require('react').PropTypes.number, require('react').PropTypes.string]).isRequired,
  nested_object_level_1: require('react').PropTypes.shape({
    string_property_1: require('react').PropTypes.string.isRequired,
    nested_object_level_2: require('react').PropTypes.shape({
      nested_object_level_3: require('react').PropTypes.shape({
        string_property_3: require('react').PropTypes.string.isRequired
      }).isRequired,
      string_property_2: require('react').PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  should_error_if_provided: function should_error_if_provided(props, propName, componentName) {
    if (props[propName] != null) return new Error('Invalid prop `' + propName + '` of value `' + value + '` passed to `' + componentName + '`. Expected undefined or null.');
  }
};
exports.default = Foo;

