exports.lintJavaScript = function({ include, exclude, options }) {
  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          include,
          exclude,
          enforce: 'pre',

          loader: 'eslint-loader',
          options,
        },
      ],
    },
  };
};

exports.loadJavaScript = function({ include, exclude }) {
  return {
    module: {
      rules: [
        { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      ],
    },
  };
};