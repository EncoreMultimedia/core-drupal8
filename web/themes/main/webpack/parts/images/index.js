exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /.*\.(gif|png|jpg|jpeg|svg)$/i,
        use: {
          loader: 'url-loader',
          options,
        },
      },
    ],
  },
});
