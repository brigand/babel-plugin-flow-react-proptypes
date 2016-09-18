import {$debug, PLUGIN_NAME} from './util';

export default function convertToPropTypes(node, importedTypes, internalTypes) {
  $debug('convertToPropTypes', node);
  let resultPropType;
  
  if (!node) resultPropType = {};
  else if (node.type === 'ObjectTypeAnnotation') {
    const ret = node.properties.map((subnode) => {
      const key = subnode.key.name;
      let value = subnode.value;

      // recurse
      value = convertToPropTypes(value, importedTypes, internalTypes);

      // handles id?: string
      if (value) {
        value.isRequired = !subnode.optional && !value.optional;
      }

      return {key, value};
    });

    resultPropType = {type: 'shape', properties: ret};
  }
  else if (node.type === 'FunctionTypeAnnotation') resultPropType = {type: 'func'};
  else if (node.type === 'AnyTypeAnnotation') resultPropType = {type: 'any'};
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
  else if (node.type === 'IntersectionTypeAnnotation') resultPropType = {type: 'any'};
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
      resultPropType = {type: 'any'};
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
