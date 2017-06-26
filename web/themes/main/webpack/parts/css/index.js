exports.loadCSS = function({ include, exclude } = {}) {
  return {
    module: {
      rules: [
        {
          test: /\.scss$/,
          include,
          exclude,

          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.css$/,
          include,
          exclude,

          use: ['style-loader', 'css-loader'],
        },
      ],
    },
  };
};

exports.lintCSS = function({ include, exclude }) {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,
          enforce: 'pre',

          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [
                require('stylelint')({
                  // Ignore node_modules CSS
                  ignoreFiles: 'node_modules/**/*.css',
                }),
              ];
            },
          },
        },
      ],
    },
  };
};
