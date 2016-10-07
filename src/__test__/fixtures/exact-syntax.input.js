type FooProps = {
  bar: {|
    a: string,
    b: number,
  |}
};

class Foo extends React.Component {
  props: FooProps;

  render() { return <div /> }
};
