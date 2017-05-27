import {$debug, makeLiteral, PLUGIN_NAME} from './util';
import * as t from 'babel-types';
import template from 'babel-template';

const USE_PROPTYPES_PACKAGE = true;


/**
 * Top-level function to generate prop-types AST.
 *
 * This will return an expression sufficient for assignment to the
 * propTypes property of an React component.
 *
 * For complex types, this will be an object, not a shape.
 *
 * @param propTypeData Intermediate representation
 * @returns {*} AST
 */
export default function makePropTypesAst(propTypeData) {
  if (propTypeData.type === 'shape-intersect-runtime') {
    // For top-level usage, e.g. Foo.proptype, return
    // an expression returning an object.
    return makeObjectMergeAstForShapeIntersectRuntime(propTypeData);
  }
  else if (propTypeData.type === 'shape') {
    return makeObjectAstForShape(propTypeData);
  }
  else {
    // Required to handle non-object exports.
    return makePropType(propTypeData);
  }
};


/**
 * Generates AST for run-time merges involving either import variables,
 * local types (shape) and other run-time merges.
 *
 * The returned AST is an expression that, when evaluated, returns an
 * object:
 *
 * The expression may look like this:
 *
 * TODO: Does the nested case below actually work?
 *
 * Object.assign(
 *    {},
 *    {foo: bar},
 *    someImportedType === require('prop-types).any ? {} : someImportedType,
 *    {qux: 2},
 *    Object.assign(
 *      {},
 *      {nested: 2}
 *    ),
 *    {quz: require('prop-types').shape({foo: bar}),
 * );
 *
 * This method is mainly useful when objects are actually required, such as when the
 * type is participating in an intersection or when the result of the intersection is
 * to be used as the main proptypes, e.g. for Foo.propTypes = {..object}.
 *
 * For other uses, the returned object must be wrapped in a shape. See
 * makeShapeAstForShapeIntersectRuntime().
 *
 * @param propTypeData intermediate representation
 * @returns {*}
 */
function makeObjectMergeAstForShapeIntersectRuntime(propTypeData) {
  const propTypeObjects = [];
  propTypeData.properties.forEach(propTypeSpec => {
    if (propTypeSpec.type === 'raw') {
      let propTypeObject = t.identifier(propTypeSpec.value);

      // This will just be a variable, referencing an import we
      // generated above. This variable may contain prop-types.any,
      // which will not work when used in an intersection.
      const importNode = makePropTypeImportNode();
      const anyNode = t.memberExpression(importNode, t.identifier('any'));
      const testExpression = t.binaryExpression('===', propTypeObject, anyNode);
      propTypeObject = t.conditionalExpression(testExpression, t.objectExpression([]), propTypeObject);
      propTypeObjects.push(propTypeObject);

    }
    else if (propTypeSpec.type === 'shape') {
      propTypeObjects.push(makeObjectAstForShape(propTypeSpec));
    }
    else if (propTypeSpec.type === 'shape-intersect-runtime') {
      // TODO: simplify all of this recursive code?
      // This returns an object.
      propTypeObjects.push(makeObjectMergeAstForShapeIntersectRuntime(propTypeSpec));
    }
  });
  const runtimeMerge = t.callExpression(
      t.memberExpression(t.identifier('Object'),
          t.identifier('assign')
      ),
      [t.objectExpression([]), ...propTypeObjects]);
  return runtimeMerge;
}

/**
 * Like makeShapeAstForShapeIntersectRuntime, but wraps the props in a shape.
 *
 * This is useful for nested uses.
 *
 */
function makeShapeAstForShapeIntersectRuntime(propTypeData) {
  const runtimeMerge = makeObjectMergeAstForShapeIntersectRuntime(propTypeData);
  return t.callExpression(
      t.memberExpression(
          makePropTypeImportNode(),
          t.identifier('shape'),
      ),
      [runtimeMerge],
  );
}

function makeObjectAstForShape(propTypeData) {
  // TODO: this is almost duplicated with the shape handling below;
  // but this code does not generate AST for a shape function,
  // but returns the AST for the object instead.
  const rootProperties = propTypeData.properties.map(({key, value}) => {
    return t.objectProperty(
        t.identifier(key),
        makePropType(value)
    );
  });
  return t.objectExpression(rootProperties);
}

function makePropTypeImportNode() {
  if (USE_PROPTYPES_PACKAGE) {
    return t.callExpression(t.identifier('require'), [makeLiteral('prop-types')]);
  }
  else {
    const reactNode = t.callExpression(t.identifier('require'), [makeLiteral('react')]);
    return t.memberExpression(reactNode, t.identifier('PropTypes'));
  }
}
/**
 * Handles all prop types.
 *
 * Returns what is expected on the right-hand side of a proptype; that is,
 * the actual validation function.
 *
 * Some special cases exist related to top-level proptypes, where an object is required
 * instead of a function. This method does not handle these details: it turns the intermediate
 * representation into something that can be used inside a propType object:
 *
 * Foo.propTypes = {
 *    bar: makePropType(intermediateRepresentation1),
 *    baz: makePropType(intermediateRepresentation2),
 * }
 *
 * @param data Intermediate representation of one single proptype
 * @param isExact ??
 * @returns {*} AST for the prop-types validation function
 */
function makePropType(data, isExact) {

  const method = data.type;

  if (method === 'exact') {
    data.properties.isRequired = data.isRequired;
    return makePropType(data.properties, true);
  }

  let isRequired = true;
  let node = makePropTypeImportNode();

  if (method === 'any' || method === 'string' || method === 'number' || method === 'bool' || method === 'object' ||
      method === 'array' || method === 'func' || method === 'node') {
    node = t.memberExpression(node, t.identifier(method));
  }
  else if (method === 'raw') {
    // In 'raw', we handle variables - typically derived from imported types.
    // These are either - at run-time - objects or functions. Objects are wrapped in a shape;
    // for functions, we assume that the variable already contains a proptype assertion

    const variableNode = t.identifier(data.value);
    const shapeNode = t.callExpression(
        t.memberExpression(
            makePropTypeImportNode(),
            t.identifier('shape'),
        ),
        [variableNode],
    );
    const functionCheckNode = t.binaryExpression('===', t.unaryExpression('typeof', variableNode), t.stringLiteral('function'));
    node = t.conditionalExpression(functionCheckNode, variableNode, shapeNode);
    isRequired = false;
  }
  else if (method === 'shape') {
    const shapeObjectProperties = data.properties.map(({key, value}) => {
      return t.objectProperty(t.identifier(key), makePropType(value));
    });
    if (isExact || data.isExact) {
      shapeObjectProperties.push(
        t.objectProperty(
          t.identifier('__exact__'),
          exactTemplate({
            '$props$': t.objectExpression(data.properties.map(({key}) => t.objectProperty(t.identifier(key), t.booleanLiteral(true))))
          }).expression
        )
      );
    }
    const shapeObjectExpression = t.objectExpression(shapeObjectProperties);
    node = t.callExpression(
        t.memberExpression(node, t.identifier('shape')),
        [shapeObjectExpression]
    );
  }
  else if (method === 'shape-intersect-runtime') {
    // Return shape, not object
    node = makeShapeAstForShapeIntersectRuntime(data);
  }
  else if (method === 'arrayOf') {
    node = t.callExpression(
      t.memberExpression(node, t.identifier('arrayOf')),
      [makePropType(data.of)]
    );
  }
  else if (method === 'oneOf') {
    node = t.callExpression(
      t.memberExpression(node, t.identifier('oneOf')),
      [t.arrayExpression(data.options.map(makeLiteral))]
    );
  }
  else if (method === 'oneOfType') {
    node = t.callExpression(
      t.memberExpression(node, t.identifier('oneOfType')),
      [t.arrayExpression(data.options.map(makePropType))]
    );
  }
  else if (method === 'void') {
    node = dontSetTemplate().expression;
  }
  else {
    const bugData = JSON.stringify(data, null, 2);
    $debug('Unknown node ' + bugData);
    throw new Error(`${PLUGIN_NAME} processing error: This is an internal error that should never happen. ` +
      `Report it immediately with the source file and babel config. Data: ${bugData}`);
  }

  if (isRequired && data.isRequired && method !== 'void') {
    node = t.memberExpression(node, t.identifier('isRequired'));
  }

  return node;
}

const dontSetTemplate = template(`
(props, propName, componentName) => {
  if(props[propName] != null) return new Error(\`Invalid prop \\\`\${propName}\\\` of value \\\`\${value}\\\` passed to \\\`\${componentName\}\\\`. Expected undefined or null.\`);
}
`);

const exactTemplate = template(`
(values, prop, displayName) => {
  var props = $props$;
  var extra = [];
  for (var k in values) {
    if (values.hasOwnProperty(k) && !props.hasOwnProperty(k)) {
      extra.push(k);
    }
  }
  if (extra.length > 0) {
    return new Error('Invalid additional prop(s) ' + JSON.stringify(extra));
  }
}
`);
