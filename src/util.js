import * as t from 'babel-types';
import traverse from 'babel-traverse';

export const $debug = () => {};
// export const $debug = console.error.bind(console);

export const PLUGIN_NAME = 'babel-plugin-flow-react-proptypes';

export function isExact(node) {
  return node.id.name === '$Exact';
}

export function makeLiteral(value) {
  if (typeof value === 'string') return t.stringLiteral(value);
  else if (typeof value === 'number') return t.numericLiteral(value);
  else if (typeof value === 'boolean') return t.booleanLiteral(value);
  else {
    $debug('Encountered invalid literal', value);
    throw new TypeError(`Invalid type supplied, this is a bug in ${PLUGIN_NAME}, typeof is ${typeof value} with value ${value}`);
  }
}

export function getExportNameForType(name) {
  return `bpfrpt_proptype_${name}`;
}

export function containsReactElement(node) {
  const fakeRoot = {
    type: 'File', program: {
      type: 'Program',
      sourceType: 'module',
      body: [node],
    },
  };
  let matched = false;

  traverse(fakeRoot, {
    JSXElement(path) {
      matched = true;
      path.stop();
    },
    CallExpression(path) {
      if (matched) {
        path.stop();
        return;
      }

      const {node} = path;
      const {callee} = node;
      if (callee.type !== 'MemberExpression') return;
      if (
        callee.object && callee.object.name === 'React'
        && callee.property && callee.property.name === 'createElement'
      ) {
        matched = true;
        path.stop();
      }
    }
  });
  return matched;
}

export function hasReactElementTypeAnnotationReturn(node) {
  if (node.type !== 'ArrowFunctionExpression') {
    return false;
  }
  if (!node.returnType || node.returnType.type !== 'TypeAnnotation') {
    return false;
  }

  const type = node.returnType.typeAnnotation;
  if (type.type === 'GenericTypeAnnotation') {
    if (type.id && type.id.name === 'ReactElement') {
      return true;
    }
    else {
      return false;
    }
  }

  return false;
}
