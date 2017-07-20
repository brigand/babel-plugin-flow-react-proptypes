import {$debug, isExact, PLUGIN_NAME} from './util';

function getObjectTypePropertyKey(node) {
  if (node.key.type === 'StringLiteral') {
    return `"${node.key.value}"`;
  }
  return node.key.name;
}

export default function convertToPropTypes(node, importedTypes, internalTypes) {
  $debug('convertToPropTypes', node);
  let resultPropType;

  if (node.type === 'ObjectTypeAnnotation') {
    const properties = [];

    // recurse on object properties
    node.properties.forEach((subnode) => {
      // result may be from:
      //  ObjectTypeProperty - {key, value}
      //  ObjectTypeSpreadProperty - Array<{key, value}>
      const result = convertToPropTypes(subnode, importedTypes, internalTypes);

      if (Array.isArray(result)){
        result.forEach((prop) => properties.push(prop));
      }
      else {
        properties.push(result);
      }
    });

    // return a shape
    resultPropType = {type: 'shape', properties, isExact: node.exact};
  }
  else if (node.type === 'ObjectTypeProperty') {
    const key = getObjectTypePropertyKey(node);
    let value = node.value;

    // recurse
    value = convertToPropTypes(value, importedTypes, internalTypes);

    // handles id?: string
    if (value) {
      value.isRequired = !node.optional && !value.optional;
    }

    return {key, value};
  }
  else if (node.type === 'ObjectTypeSpreadProperty') {
    const exact = isExact(node.argument);
    let subnode;
    if(exact) {
      subnode = node.argument.typeParameters.params[0];
    }
    else {
      subnode = node.argument;
    }

    const spreadShape = convertToPropTypes(subnode, importedTypes, internalTypes);
    const properties = spreadShape.properties;

    // Unless or until the strange default behavior changes in flow (https://github.com/facebook/flow/issues/3214)
    // every property from spread becomes optional unless it uses `...$Exact<T>`

    // @see also explanation of behavior - https://github.com/facebook/flow/issues/3534#issuecomment-287580240
    // @returns flattened properties from shape
    if(!exact) {
      properties.forEach((prop) => prop.value.isRequired = false);
    }
    return properties;
  }
  else if (node.type === 'FunctionTypeAnnotation') resultPropType = {type: 'func'};
  else if (node.type === 'AnyTypeAnnotation') resultPropType = {type: 'any'};
  else if (node.type === 'ExistentialTypeParam') resultPropType = {type: 'any'};
  else if (node.type === 'MixedTypeAnnotation') resultPropType = {type: 'any'};
  else if (node.type === 'TypeofTypeAnnotation') resultPropType = {type: 'any'};
  else if (node.type === 'NumberTypeAnnotation') resultPropType = {type: 'number'};
  else if (node.type === 'StringTypeAnnotation') resultPropType = {type: 'string'};
  else if (node.type === 'BooleanTypeAnnotation') resultPropType = {type: 'bool'};
  else if (node.type === 'VoidTypeAnnotation') resultPropType = {type: 'void'};
  else if (node.type === 'TupleTypeAnnotation') resultPropType = {type: 'arrayOf', of: {type: 'any'}};
  else if (node.type === 'NullableTypeAnnotation') {
    resultPropType = convertToPropTypes(node.typeAnnotation, importedTypes, internalTypes);
    resultPropType.optional = true;
  }
  else if (node.type === 'IntersectionTypeAnnotation') {
    const objectTypeAnnotations = node.types.filter(annotation => annotation.type === 'ObjectTypeAnnotation' || annotation.type === 'GenericTypeAnnotation');

    const propTypes = objectTypeAnnotations.map(node => convertToPropTypes(node, importedTypes, internalTypes));
    const shapes = propTypes.filter(propType => propType.type === 'shape');

    const requiresRuntimeMerge = propTypes.filter(propType => propType.type === 'raw' || propType.type === 'shape-intersect-runtime');
    const mergedProperties = [].concat(...shapes.map(propType => propType.properties));

    if (mergedProperties.length === 0 && requiresRuntimeMerge.length === 0) {
      resultPropType = {type: 'any'};
    }
    else if (requiresRuntimeMerge.length === 0) {
      resultPropType = {'type': 'shape', properties: mergedProperties};
    }
    else {
      // TODO: properties may be a misnomer - that probably means a list of object
      // property specifications
      resultPropType = {'type': 'shape-intersect-runtime', properties: propTypes};
    }
  }
  // Exact
  else if (node.type === 'GenericTypeAnnotation' && node.id.name === '$Exact') {
    resultPropType = {
      type: 'exact',
      properties: convertToPropTypes(node.typeParameters.params[0], importedTypes, internalTypes),
    };
  }
  else if (node.type === 'GenericTypeAnnotation' || node.type === 'ArrayTypeAnnotation') {
    if (node.type === 'ArrayTypeAnnotation' || node.id.name === 'Array') {
      let arrayType;
      if (node.type === 'ArrayTypeAnnotation') {
        arrayType = node.elementType;
      }
      else {
        arrayType = node.typeParameters.params[0];
      }
      if (arrayType.type === 'GenericTypeAnnotation' &&
        arrayType.id.type === 'QualifiedTypeIdentifier' &&
        arrayType.id.qualification.name === 'React' &&
        arrayType.id.id.name === 'Element') {
        resultPropType = {type: 'node'};
      }
      else {
        resultPropType = {type: 'arrayOf', of: convertToPropTypes(arrayType, importedTypes, internalTypes)};
      }
    }
    else if (node.id && node.id.name && internalTypes[node.id.name]) {
      resultPropType = Object.assign({}, internalTypes[node.id.name]);
    }
    else if (node.id && node.id.name && importedTypes[node.id.name]) {
      resultPropType = {type: 'raw', value: importedTypes[node.id.name]};
    }
    else if (node.id.name === 'Object') {
      resultPropType = {type: 'object'};
    }
    else if (node.id.name === 'Function') {
      resultPropType = {type: 'func'};
    }
    else {
      resultPropType = {type: 'possible-class', value: node.id};
    }
  }
  else if (node.type === 'UnionTypeAnnotation') {
    const {types} = node;

    const typesWithoutNulls = types.filter(t => t.type !== 'NullLiteralTypeAnnotation');

    // If a NullLiteralTypeAnnotation we know that this union type is not required.
    const optional = typesWithoutNulls.length !== types.length;

    // e.g. null | string
    //     'foo' | null
    if (typesWithoutNulls.length === 1) {
      resultPropType = convertToPropTypes(typesWithoutNulls[0], importedTypes, internalTypes);
      resultPropType.optional = optional;
    }
    else if (typesWithoutNulls.every(t => /Literal/.test(t.type))) {
      // e.g. 'hello' | 5
      resultPropType = {
        type: 'oneOf',
        optional: optional,
        options: typesWithoutNulls.map(({value}) => value)
      };
    }
    else {
      // e.g. string | number
      resultPropType = {
        type: 'oneOfType',
        optional: optional,
        options: typesWithoutNulls.map((node) => convertToPropTypes(node, importedTypes, internalTypes))
      };
    }
  }
  else if (node.type in {
    'StringLiteralTypeAnnotation': 0,
    'NumericLiteralTypeAnnotation': 0,
    'BooleanLiteralTypeAnnotation': 0,
    'NullLiteralTypeAnnotation': 0,
  }) {
    resultPropType = {type: 'oneOf', options: [node.value]};
  }

  if (resultPropType) {
    return resultPropType;
  }
  else {
    throw new Error(`${PLUGIN_NAME}: Encountered an unknown node in the type definition. Node: ${JSON.stringify(node)}`);
  }
}
