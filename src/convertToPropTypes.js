import {$debug, isExact, PLUGIN_NAME} from './util';

function getObjectTypePropertyKey(node) {
  if (node.key.type === 'StringLiteral') {
    return `"${node.key.value}"`;
  }
  return node.key.name;
}

function mapGenericToRealType(node, typeParamMapping) {
  if (node.type === 'GenericTypeAnnotation' && node.id.type === 'Identifier') {
    return typeParamMapping[node.id.name] || node;
  }
  else if (node.type === 'NullableTypeAnnotation') {
    const realTypeAnnotation = mapGenericToRealType(node.typeAnnotation, typeParamMapping);
    const newNode = Object.assign({}, node, {
      typeAnnotation: realTypeAnnotation,
    });
    return newNode;
  }
  else if (node.type === 'UnionTypeAnnotation') {
    const realTypes = node.types.map(n => mapGenericToRealType(n, typeParamMapping));
    const newNode = Object.assign({}, node, {
      types: realTypes,
    });
    return newNode;
  }
  else if (node.type === 'ObjectTypeProperty') {
    const realValue = mapGenericToRealType(node.value, typeParamMapping);
    const newNode = Object.assign({}, node, {
      value: realValue,
    });
    return newNode;
  }
  else if (node.type === 'ObjectTypeAnnotation') {
    const realProperties = node.properties.map(p => mapGenericToRealType(p, typeParamMapping));
    const newNode = Object.assign({}, node, {
      properties: realProperties,
    });
    return newNode;
  }
  return node;
}

function convertGenericToPropTypes(node, typeParamMapping, importedTypes, internalTypes) {
  if (node.type === 'GenericTypeAnnotation' && node.id.type === 'Identifier' && !node.typeParameters) {
    return convertToPropTypes(typeParamMapping[node.id.name], importedTypes, internalTypes);
  }
  else if (node.type === 'GenericTypeAnnotation' && node.typeParameters) {
    const realTypeParameters = node.typeParameters.params.map(p => mapGenericToRealType(p, typeParamMapping));
    return internalTypes[node.id.name](realTypeParameters);
  }
  else if (node.type === 'ArrayTypeAnnotation') {
    const realElementType = mapGenericToRealType(node.elementType, typeParamMapping);
    const realNode = Object.assign({}, node, {
      elementType: realElementType,
    });
    return convertToPropTypes(realNode, importedTypes, internalTypes);
  }
  else if (node.type === 'NullableTypeAnnotation') {
    const result = convertGenericToPropTypes(node.typeAnnotation, typeParamMapping, importedTypes, internalTypes);
    result.optional = true;
    return result;
  }
  else if (node.type === 'UnionTypeAnnotation') {
    const types = node.types.map(n => mapGenericToRealType(n, typeParamMapping));
    const realNode = Object.assign({}, node, {
      types,
    });
    return convertToPropTypes(realNode, importedTypes, internalTypes);
  }
  else if (node.type === 'ObjectTypeAnnotation') {
    const properties = node.properties.map(n => mapGenericToRealType(n, typeParamMapping));
    const realNode = Object.assign({}, node, {
      properties,
    });
    return convertToPropTypes(realNode, importedTypes, internalTypes);
  }
}

export default function convertToPropTypes(node, importedTypes, internalTypes) {
  $debug('convertToPropTypes', node);
  let resultPropType;
  
  if (node.type === 'TypeAlias' && node.typeParameters) {
    return (types) => {
      const typeParams = node.typeParameters.params.map(t => t.name);
      const typeParamMapping = {};
      for (let i = 0; i < typeParams.length; i++) {
        typeParamMapping[typeParams[i]] = types[i];
      }
      // console.log(node.right, typeParamMapping);
      return convertGenericToPropTypes(node.right, typeParamMapping, importedTypes, internalTypes);
    };
  }
  else if (node.right) {
    node = node.right;
  }

  if (node.type === 'ObjectTypeAnnotation') {
    const properties = [];

    // recurse on object properties
    node.properties.forEach((subnode) => {
      // result may be from:
      //  ObjectTypeProperty - {key, value}
      //  ObjectTypeSpreadProperty - Array<{key, value}>
      const result = convertToPropTypes(subnode, importedTypes, internalTypes);
      if (subnode.leadingComments && subnode.leadingComments.length) {
        result.leadingComments = subnode.leadingComments;
      }
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
  // babylon6 Node Name
  else if (node.type === 'ExistentialTypeParam') resultPropType = {type: 'any'};
  // babylon7 Node Name
  else if (node.type === 'ExistsTypeAnnotation') resultPropType = {type: 'any'};
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
  // https://github.com/brigand/babel-plugin-flow-react-proptypes/issues/147
  else if (node.type === 'GenericTypeAnnotation'
    && node.id.type === 'QualifiedTypeIdentifier'
    && node.id.qualification
    && node.id.qualification.name === 'React'
    && node.id.id
    && node.id.id.name === 'ElementProps'
  ) {
    const tp = node.typeParameters && node.typeParameters.params;
    if (!tp || tp.length !== 1) {
      throw new TypeError(`babel-plugin-flow-react-proptypes expected React.ElementProps to have one type parameter`);
    }
    if (tp[0].type === 'StringLiteralTypeAnnotation') {
      resultPropType = {
        type: 'object',
        properties: [],
      };
    }
    else if (tp[0].type === 'TypeofTypeAnnotation') {
      const { argument } = tp[0];
      const { id } = argument;
      if (id.type !== 'Identifier') {
        throw new TypeError(`babel-plugin-flow-react-proptypes expected React.ElementProps<typeof OneIdentifier>, but found some other type parameter`);
      }
      const { name } = id;
      resultPropType = {
        type: 'reference',
        propertyPath: [name, 'propTypes'],
      };
    }
    else {
      throw new TypeError(`babel-plugin-flow-react-proptypes expected React.ElementProps to either be e.g. React.ElementProps<'div'> or React.ElementProps<typeof SomeComponent> `);
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
      else if (!node.typeParameters) {
        resultPropType = { type: 'array' };
        arrayType = null;
      }
      else {
        arrayType = node.typeParameters.params[0];
      }
      if (arrayType &&
        arrayType.type === 'GenericTypeAnnotation' &&
        arrayType.id.type === 'QualifiedTypeIdentifier' &&
        arrayType.id.qualification.name === 'React' &&
        (arrayType.id.id.name === 'Element' || arrayType.id.id.name === 'Node')) {
        resultPropType = {type: 'node'};
      }
      else if (arrayType) {
        resultPropType = {type: 'arrayOf', of: convertToPropTypes(arrayType, importedTypes, internalTypes)};
      }
    }
    else if (node.type === 'GenericTypeAnnotation' &&
      node.id.type === 'QualifiedTypeIdentifier' &&
      node.id.qualification.name === 'React' &&
      (node.id.id.name === 'Element' || node.id.id.name === 'Node')) {
      resultPropType = {type: 'node'};
    }
    else if (node.type === 'GenericTypeAnnotation' && node.typeParameters && typeof internalTypes[node.id.name] === 'function') {
      resultPropType = Object.assign({}, internalTypes[node.id.name](node.typeParameters.params));
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

    const typesWithoutNulls = types.filter(t => t.type !== 'NullLiteralTypeAnnotation' && t.type !== 'VoidTypeAnnotation');

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
    // Babylon6
    'NumericLiteralTypeAnnotation': 0,
    // Babylon7
    'NumberLiteralTypeAnnotation': 0,
    'BooleanLiteralTypeAnnotation': 0,
    'NullLiteralTypeAnnotation': 0,
  }) {
    let value = node.value;
    // babylon7 does not provide value for NullLiteralTypeAnnotation
    if (node.type === 'NullLiteralTypeAnnotation') {
      value = true;
    }
    resultPropType = {type: 'oneOf', options: [value]};
  }

  if (resultPropType) {
    return resultPropType;
  }
  else {
    throw new Error(`${PLUGIN_NAME}: Encountered an unknown node in the type definition. Node: ${JSON.stringify(node)}`);
  }
}
