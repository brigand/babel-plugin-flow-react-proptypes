import {
  $debug,
  getExportNameForType,
  containsReactElement,
  PLUGIN_NAME,
  hasReactElementTypeAnnotationReturn,
} from './util';
import convertToPropTypes from './convertToPropTypes';
import {makePropTypesAstForExport, makePropTypesAstForPropTypesAssignment} from './makePropTypesAst';

// maps between type alias name to prop types
let internalTypes = {};

// maps between type alias to import alias
let importedTypes = {};
let suppress = false;
const SUPPRESS_STRING = 'no babel-plugin-flow-react-proptypes';

// General control flow:
// Parse flow type annotations in index.js
// Convert to intermediate representation via convertToPropTypes.js
// Convert to prop-types AST in makePropTypesAst.js

const convertNodeToPropTypes = node => convertToPropTypes(
  node,
  importedTypes,
  internalTypes
);

const getPropsForTypeAnnotation = typeAnnotation => {
  let props = null;

  if (typeAnnotation.properties || typeAnnotation.type === 'GenericTypeAnnotation'
      || typeAnnotation.type === 'IntersectionTypeAnnotation'
      || typeAnnotation.type === 'AnyTypeAnnotation') {
    props = convertNodeToPropTypes(typeAnnotation);
  }
  else if (typeAnnotation.properties != null || typeAnnotation.type != null) {
    $debug('typeAnnotation not of expected type, not generating propTypes: ', typeAnnotation);
  }
  else {
    throw new Error(`Expected prop types, but found none. This is a bug in ${PLUGIN_NAME}`);
  }

  return props;
};

const getFunctionalComponentTypeProps = path => {
  // Check if this looks like a stateless react component with PropType reference:
  const firstParam = path.node.params[0];
  const typeAnnotation = firstParam
    && firstParam.typeAnnotation
    && firstParam.typeAnnotation.typeAnnotation;

  if (!typeAnnotation) {
    $debug('Found stateless component without type definition');
    return;
  }

  return getPropsForTypeAnnotation(typeAnnotation);
};

module.exports = function flowReactPropTypes(babel) {
  const t = babel.types;

  const isFunctionalReactComponent = path => {
    if ((path.type === 'ArrowFunctionExpression' || path.type === 'FunctionExpression') && !path.parent.id) {
      // Could be functions inside a React component
      return false;
    }
    if (hasReactElementTypeAnnotationReturn(path.node)) {
      return true;
    }
    if (containsReactElement(path.node)) {
      return true;
    }
    return false;
  };

    /**
     * Called when visiting a node.
     *
     * Converts the props param to AST and attaches it at the proper location,
     * depending on the path param.
     *
     *
     * @param path
     * @param props
     */
  const annotate = (path, props) => {
    let name;
    let targetPath;


    if (path.type === 'ArrowFunctionExpression' || path.type === 'FunctionExpression') {
      name = path.parent.id.name;
      const basePath = path.parentPath.parentPath;
      targetPath = t.isExportDeclaration(basePath.parent) ? basePath.parentPath : basePath;
    }
    else {
      name = path.node.id.name;
      targetPath = ['Program', 'BlockStatement'].indexOf(path.parent.type) >= 0 ? path : path.parentPath;
    }

    if (!props) {
      throw new Error(`Did not find type annotation for ${name}`);
    }

    const propTypesAST = makePropTypesAstForPropTypesAssignment(props);
    if (propTypesAST == null) {
      return;
    }
    const attachPropTypesAST = t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier(name), t.identifier('propTypes')),
        propTypesAST
      )
    );
    targetPath.insertAfter(attachPropTypesAST);
  };

    /**
     * Visitor for functions.
     *
     * Determines if a function is a functional react component and
     * inserts the proptypes AST via `annotate`.
     *
     * @param path
     */
  const functionVisitor = path => {
    if (!isFunctionalReactComponent(path)) {
      return;
    }
    const props = getFunctionalComponentTypeProps(path);
    if (props) {
      annotate(path, props);
    }
  };

  return {
    visitor: {
      Program(path, {opts}) {
        internalTypes = {};
        importedTypes = {};
        suppress = false;
        const directives = path.node.directives;
        if(directives && directives.length)  {
          const directive = directives[0];
          if (directive.value && directive.value.value == SUPPRESS_STRING) {
            suppress = true;
          }
        }
        if (this.file && this.file.opts && this.file.opts.filename) {
          if (this.file.opts.filename.indexOf('node_modules') >= 0) {
            // Suppress any file that lives in node_modules IF the
            // ignoreNodeModules setting is true
            suppress = opts.ignoreNodeModules;
          }
        }
      },
      TypeAlias(path) {
        if (suppress) return;
        $debug('TypeAlias found');
        const {right} = path.node;

        const typeAliasName = path.node.id.name;
        if (!typeAliasName) {
          throw new Error('Did not find name for type alias');
        }

        const propTypes = convertNodeToPropTypes(right);
        internalTypes[typeAliasName] = propTypes;
      },
      ClassDeclaration(path) {
        if (suppress) return;
        const {superClass} = path.node;

        // check if we're extending React.Compoennt
        const extendsReactComponent = superClass && superClass.type === 'MemberExpression'
        && superClass.object.name === 'React'
        && (superClass.property.name === 'Component' || superClass.property.name === 'PureComponent');
        const extendsComponent = superClass
                                 && superClass.type === 'Identifier'
                                 && (superClass.name === 'Component' || superClass.name === 'PureComponent');
        if (!extendsReactComponent && !extendsComponent) {
          $debug('Found a class that isn\'t a react component', superClass);
          return;
        }

        // And have type as property annotations or Component<void, Props, void>
        path.node.body.body.forEach(bodyNode => {
          if (bodyNode && bodyNode.key.name === 'props' && bodyNode.typeAnnotation) {
            const props = getPropsForTypeAnnotation(bodyNode.typeAnnotation.typeAnnotation);
            return annotate(path, props);
          }
        });

        // super type parameter
        const secondSuperParam = path.node.superTypeParameters && path.node.superTypeParameters.params[1];
        if (secondSuperParam && secondSuperParam.type === 'GenericTypeAnnotation') {
          const typeAliasName = secondSuperParam.id.name;
          const props = internalTypes[typeAliasName];
          return annotate(path, props);
        }
      },

      FunctionExpression(path) {
        if (suppress) return;
        return functionVisitor(path);
      },

      FunctionDeclaration(path) {
        if (suppress) return;
        return functionVisitor(path);
      },

      ArrowFunctionExpression(path) {
        if (suppress) return;
        return functionVisitor(path);
      },

      // See issue:
      /**
         * Processes exported type aliases.
         *
         * This function also adds something to the AST directly, instead
         * of invoking annotate.
         *
         * @param path
         * @constructor
         */
      ExportNamedDeclaration(path) {
        if (suppress) return;
        const {node} = path;


        if (!node.declaration || node.declaration.type !== 'TypeAlias') {
          return;
        }

        const declarationObject = node.declaration.right;

        const name = node.declaration.id.name;
        const propTypes = convertNodeToPropTypes(declarationObject);
        internalTypes[name] = propTypes;

        const propTypesAst = makePropTypesAstForExport(propTypes);

        const exportAst = t.expressionStatement(t.callExpression(
          t.memberExpression(t.identifier('Object'), t.identifier('defineProperty')),
          [
            t.identifier('exports'),
            t.stringLiteral(getExportNameForType(name)),
            t.objectExpression([
              t.objectProperty(t.identifier('value'), propTypesAst), // FIXME: this should be the ref to the var declaration created in makePropTypesAstForPropTypesAssignment
              t.objectProperty(t.identifier('configurable'), t.booleanLiteral(true)),
            ]),
          ]
        ));
        const conditionalExportsAst = t.ifStatement(
          t.binaryExpression(
            '!==',
            t.unaryExpression(
              'typeof',
              t.identifier('exports')
            ),
            t.stringLiteral('undefined')
          ),
          exportAst
        );
        path.insertAfter(conditionalExportsAst);
      },
      ImportDeclaration(path) {
        if (suppress) return;
        const {node} = path;

        // https://github.com/brigand/babel-plugin-flow-react-proptypes/issues/62
        // if (node.source.value[0] !== '.') {
        //   return;
        // }
        if (node.importKind === 'type') {
          node.specifiers.forEach((specifier) => {
            const typeName = specifier.type === 'ImportDefaultSpecifier'
              ? specifier.local.name
              : specifier.imported.name;
            // Store the name the type so we can use it later. We do
            // mark it as importedTypes because we do handle these
            // differently than internalTypes.
            // imported types are basically realized as imports;
            // because we can be somewhat sure that we generated
            // the proper exported propTypes in the imported file
            // Later, we will check importedTypes to determine if
            // we want to put this as a 'raw' type in our internal
            // representation
            importedTypes[typeName] = getExportNameForType(typeName);
            const variableDeclarationAst = t.variableDeclaration(
              'var',
              [
                t.variableDeclarator(
                  // TODO: use local import name?
                  t.identifier(getExportNameForType(typeName)),
                  t.logicalExpression(
                    '||',
                    t.memberExpression(
                      t.callExpression(
                        t.identifier('require'),
                        [t.stringLiteral(node.source.value)]
                      ),
                      t.identifier(getExportNameForType(typeName))
                    ),
                    t.memberExpression(
                      t.callExpression(
                        t.identifier('require'),
                        [t.stringLiteral('prop-types')]
                      ),
                      t.identifier('any')
                    )
                  ),
                )
              ]
            );
            path.insertAfter(variableDeclarationAst);
          });
        }
      }
    }
  };
};
