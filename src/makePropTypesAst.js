import {$debug, makeLiteral, PLUGIN_NAME} from './util';
import * as t from 'babel-types';
import template from 'babel-template';

function makePropTypeImportNode() {
  return t.callExpression(t.identifier('require'), [makeLiteral('prop-types')]);
}
export function setMakePropTypeImportNode(fn) {
  makePropTypeImportNode = fn;
}

const dontSetTemplate = template(`
(props, propName, componentName) => {
  if(props[propName] != null) {
    throw new Error(\`Invalid prop \\\`\${propName}\\\` of value \\\`\${props[propName]}\\\` passed to \\\`\${componentName\}\\\`. Expected undefined or null.\`);
  }
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

const anyTemplate = template(`
(props, propName, componentName) => {
  if (!Object.prototype.hasOwnProperty.call(props, propName)) {
    throw new Error(\`Prop \\\`\${propName}\\\` has type 'any' or 'mixed', but was not provided to \\\`\${componentName\}\\\`. Pass undefined or any other value.\`);
  }
}
`);

const deferTpl = template(`(function() { return (NODE).apply(this, arguments); })`);

/**
 * Top-level function to generate prop-types AST.
 *
 * This will return an expression suitable for assignment to the
 * propTypes property of an React component. In particular,
 * the AST returned will always yield an object. Assignment
 * to Foo.propTypes is possible for objects, not simple
 * types.
 *
 * @param propTypeData Intermediate representation
 * @returns {*} AST expression always returning an object.
 */
export function makePropTypesAstForPropTypesAssignment(propTypeData) {
  let node = null;
  if (propTypeData.type === 'shape-intersect-runtime') {
    // For top-level usage, e.g. Foo.proptype, return
    // an expression returning an object.
    node = makeObjectMergeAstForShapeIntersectRuntime(propTypeData);
  }
  else if (propTypeData.type === 'shape') {
    node = makeObjectAstForShape(propTypeData);
  }
  else if (propTypeData.type === 'raw') {
    node = makeObjectAstForRaw(propTypeData);
  }

  return node;
}


/**
 * Top-level function to generate prop-types AST.
 *
 * This will return an expression suitable for exporting.
 *
 * This function is similar to makePropTypesAstForPropTypesAssignment, except
 * that you may export non-object expressions.
 *
 * Any items not handled by makePropTypesAstForPropTypesAssignment will be returned
 * as an AST invoking the corresponding function from the prop-types package.
 *
 * @param propTypeData Intermediate representation
 * @returns {*} AST for expression resulting in object or function
 */
export function makePropTypesAstForExport(propTypeData) {
  let ast = makePropTypesAstForPropTypesAssignment(propTypeData);
  if (ast == null) {
    // Now we handle isRequired on the import side
    // https://github.com/brigand/babel-plugin-flow-react-proptypes/issues/113
    propTypeData.isRequired = false;
    ast = makePropType(propTypeData);
  }
  return ast;
}


function makeAnyPropTypeAST() {
  const importNode = makePropTypeImportNode();
  const anyNode = t.memberExpression(importNode, t.identifier('any'));
  return anyNode;
}

function makeObjectAstForRaw(propTypeSpec, propTypeObjects) {
  let propTypeObject = typeof propTypeSpec.value === 'string'
    ? t.identifier(propTypeSpec.value)
    : propTypeSpec.value;

  // This will just be a variable, referencing an import we
  // generated above. This variable may contain prop-types.any,
  // which will not work when used in an intersection.
  const anyNode = makeAnyPropTypeAST();
  const testExpression = t.binaryExpression('===', propTypeObject, anyNode);
  propTypeObject = t.conditionalExpression(testExpression, t.objectExpression([]), propTypeObject);
  return propTypeObject;
}
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
      propTypeObjects.push(makeObjectAstForRaw(propTypeSpec));
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
  const rootProperties = propTypeData.properties.map(({key, value, leadingComments}) => {
    const node = t.objectProperty(
      t.identifier(key),
      makePropType(value)
    );
    if (leadingComments) {
      node.leadingComments = leadingComments;
    }
    return node;
  });
  return t.objectExpression(rootProperties);
}

function makeFunctionCheckAST(variableNode) {
  return t.binaryExpression('===', t.unaryExpression('typeof', variableNode), t.stringLiteral('function'));
}

function makeNullCheckAST(variableNode) {
  return t.binaryExpression('==', variableNode, t.nullLiteral());
}

function markNodeAsRequired(node) {
  return t.memberExpression(node, t.identifier('isRequired'));
}

function processQualifiedTypeIdentifierIntoMemberExpression(qualifiedTypeIdentifier) {
  const qualification = qualifiedTypeIdentifier.qualification;

  let objectAST;
  if (qualification.type === 'QualifiedTypeIdentifier') {
    objectAST = processQualifiedTypeIdentifierIntoMemberExpression(qualification);
  }
  else if (qualification.type === 'Identifier') {
    objectAST = t.identifier(qualification.name);
  }
  else {
    throw new Error('Cannot handle type of qualification property:', qualification);
  }
  const propertyAST = t.identifier(qualifiedTypeIdentifier.id.name);

  const memberExpression = t.memberExpression(objectAST, propertyAST);

  return t.conditionalExpression(makeNullCheckAST(memberExpression), t.objectExpression([]), memberExpression);

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

  let node = makePropTypeImportNode();
  let markFullExpressionAsRequired = true;

  if (method === 'string' || method === 'number' || method === 'bool' || method === 'object' ||
      method === 'array' || method === 'func' || method === 'node') {
    node = t.memberExpression(node, t.identifier(method));
  }
  else if (method === 'any' || !method) {
    markFullExpressionAsRequired = false;

    if (data.isRequired) {
      node = anyTemplate().expression;
    }
    else {
      node = t.memberExpression(node, t.identifier('any'));
    }
  }
  else if (method === 'raw') {
    markFullExpressionAsRequired = false;
    // In 'raw', we handle variables - typically derived from imported types.
    // These are either - at run-time - objects or functions. Objects are wrapped in a shape;
    // for functions, we assume that the variable already contains a proptype assertion
    let variableNode = typeof data.value === 'string' ? t.identifier(data.value) : data.value;
    const originalVariableNode = variableNode;
    let shapeNode = t.callExpression(
      t.memberExpression(
        makePropTypeImportNode(),
        t.identifier('shape'),
      ),
      [variableNode],
    );
    if (data.isRequired) {
      shapeNode = markNodeAsRequired(shapeNode);
    }
    if (data.isRequired) {
      variableNode = t.conditionalExpression(
        t.memberExpression(variableNode, t.identifier('isRequired')),
        t.memberExpression(variableNode, t.identifier('isRequired')),
        variableNode
      );
    }
    const functionCheckNode = makeFunctionCheckAST(originalVariableNode);
    node = t.conditionalExpression(functionCheckNode, variableNode, shapeNode);
    node = deferTpl({ NODE: node }).expression;
  }
  else if (method === 'shape') {
    const shapeObjectProperties = data.properties.map(({key, value, leadingComments}) => {
      const node = t.objectProperty(t.identifier(key), makePropType(value));
      if (leadingComments) {
        node.leadingComments = leadingComments;
      }
      return node;
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
      [t.arrayExpression(data.options.map(item => makePropType(item)))]
    );
  }
  else if (method === 'reference') {
    const pp = data.propertyPath.slice();
    let valueNode = t.identifier(pp.shift());
    while (pp.length) {
      valueNode = t.memberExpression(valueNode, t.identifier(pp.shift()));
    }
    node = t.callExpression(
      t.memberExpression(
        node,
        t.identifier('shape'),
      ),
      [valueNode],
    );
  }
  else if (method === 'void') {
    markFullExpressionAsRequired = false;
    node = dontSetTemplate().expression;
  }
  else if (method === 'possible-class') {
    markFullExpressionAsRequired = false;
    let classSpec;
    if (data.value.name != null) {
      classSpec = t.identifier(data.value.name);
    }
    else if (data.value.type === 'QualifiedTypeIdentifier') {
      classSpec = processQualifiedTypeIdentifierIntoMemberExpression(data.value);
    }
    else {
      throw new Error('Unknown node type in possible-class for node:', data.value);
    }
    let instanceOfNode = t.callExpression(
      t.memberExpression(node, t.identifier('instanceOf')),
      [classSpec]
    );
    let anyNode = makeAnyPropTypeAST();
    if (data.isRequired) {
      instanceOfNode = markNodeAsRequired(instanceOfNode);
      anyNode = markNodeAsRequired(anyNode);
    }
    const functionCheckNode = makeFunctionCheckAST(classSpec);
    node = t.conditionalExpression(functionCheckNode, instanceOfNode, anyNode);

    // Don't add .required on the full expression; we already handled this ourselves
    // for any proptypes we generated

    // Wrap it in a function for ES6 imports with circular dependencies
    node = deferTpl({ NODE: node }).expression;
  }
  else {
    const bugData = JSON.stringify(data, null, 2);
    $debug('Unknown node ' + bugData);
    throw new Error(`${PLUGIN_NAME} processing error: This is an internal error that should never happen. ` +
      `Report it immediately with the source file and babel config. Data: ${bugData}`);
  }

  if (markFullExpressionAsRequired && data.isRequired) {
    node = markNodeAsRequired(node);
  }

  return node;
}
