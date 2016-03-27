var {$debug, getExportNameForType} = require('./util');
var convertToPropTypes = require('./convertToPropTypes');
var makePropTypesAst = require('./makePropTypesAST');

var matchedPropTypes;

// See ExportNamedDeclaration and ImportDeclaration
var importedTypes = {};
export default function (babel) {
  var t = babel.types;

  return {
    visitor: {
      Program(path) {
        matchedPropTypes = null;
        importedTypes = {};
      },
      TypeAlias(path) {
        $debug('TypeAlias found');
        if (!/Props$/.test(path.node.id.name)) {
          $debug(`TypeAlias ${path.node.id.name} is not a Props type`);
          return;
        }
        var {right} = path.node;
        if (right.type !== 'ObjectTypeAnnotation') {
          $debug(`Expected ObjectTypeAnnotation but got ${right.type}`);
          return
        }

        var propTypes = convertToPropTypes(right, importedTypes);
        matchedPropTypes = propTypes;
      },
      ClassDeclaration(path) {
        if (!matchedPropTypes) {
          $debug('at ClassDeclaration no prop TypeAlias was found');
          return;
        }
        else {
          $debug('Found ClassDeclaration for the TypeAlias');
        }

        var {superClass} = path.node;

        // check if we're extending React.Compoennt
        var extendsReactCompoennt = superClass.type === 'MemberExpression'
        && superClass.object.name === 'React'
        && superClass.property.name === 'Component';
        var extendsComponent = superClass.type === 'Identifier' && superClass.name === 'Component';
        if (!extendsReactCompoennt && !extendsComponent) {
          debug('Found a class that isn\'t a react component', + JSON.stringify(superClass));
          return;
        }

        var name = path.node.id.name;

        var propTypeAST = makePropTypesAst(matchedPropTypes)
        var attachPropTypesAST = t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(name), t.identifier('propTypes')),
            propTypeAST
          )
        );
        path.insertAfter(attachPropTypesAST);
      },

      // See issue:
      ExportNamedDeclaration(path) {
        var {node} = path;

        if (node.declaration.type !== 'TypeAlias') {
          return;
        }

        var propTypes = convertToPropTypes(node.declaration.right, importedTypes);
        var propTypesAst = makePropTypesAst(propTypes);

        if (propTypesAst.type === 'ObjectExpression') {
          propTypesAst = t.callExpression(
            t.memberExpression(
              t.memberExpression(
                t.identifier('React'),
                t.identifier('PropTypes'),
              ),
              t.identifier('shape'),
            ),
            [propTypesAst],
          )
        }

        var exportAst = t.expressionStatement(t.callExpression(
          t.memberExpression(t.identifier('Object'), t.identifier('defineProperty')),
          [
            t.memberExpression(t.identifier('module'), t.identifier('exports')),
            t.stringLiteral(getExportNameForType(node.declaration.id.name)),
            propTypesAst,
          ]
        ));
        path.insertAfter(exportAst);
      },
      ImportDeclaration(path) {
        var {node} = path;
        if (node.importKind === 'type') {
          node.specifiers.forEach((specifier) => {
            var typeName = specifier.imported.name;
            importedTypes[typeName] = getExportNameForType(typeName);
            var variableDeclarationAst = t.variableDeclaration(
              'var',
              [
                t.variableDeclarator(
                  // TODO: use local import name?
                  t.identifier(getExportNameForType(typeName)),
                  t.memberExpression(
                    t.callExpression(
                      t.identifier('require'),
                      [t.stringLiteral(node.source.value)]
                    ),
                    t.identifier(getExportNameForType(typeName))
                  ),
                )
              ]
            );
            path.insertAfter(variableDeclarationAst);
          });
        }
      }
    }
  }
};
