const babel = require('babel-core');
const content = `
import React, {PropTypes} from 'react';

type AlbumCardProps = {
  data: {
    stats: {
      images: number,
      videos: number,
      reposts: number,
      shares: number,
      stashes: number,
      likes: number,
      comments: number
    },
    title: string,
    coverImage: {
      id: string,
      src: string
    },
    description: string,
    userIsFollowing: true | false,
  }
}

export default
class AlbumCard extends React.Component {
  props: AlbumCardProps;

  render() {
    return (
      <Box>

      </Box>
    );
  }
}
`;

it('real', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['es2015', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});
