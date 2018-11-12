const babel = require('babel-core');
const content = `
// @flow
import * as React from 'react';

export default function<P: {}>(
    Component: React.StatelessFunctionalComponent<P>,
    componentName: string = Component.displayName || Component.name
): React.ComponentType<*> {
    return class PureStateless extends React.PureComponent<P> {
        // $FlowFixMe
        static defaultProps = Component.defaultProps;
        static displayName = \`PureStateless(\${componentName})\`;
        static contextTypes = Component.contextTypes;
        // $FlowFixMe
        static propTypes = Component.propTypes;
        context: any;
        render() {
            return Component(this.props, this.context);
        }
    };
}

`;

it('real2', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
