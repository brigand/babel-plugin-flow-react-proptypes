type FooProps = {
  bar: $Exact<{
    a: string,
    b: number,
  }>
};

class Foo extends React.Component {
  props: FooProps;

  render() { return <div /> }
};
