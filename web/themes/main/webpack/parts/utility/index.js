const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    proxy: {
      '**': 'http://localhost:8000',
    },
    publicPath: 'http://localhost:8080/themes/main/public',
    historyApiFallback: true,
    stats: 'errors-only',
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    overlay: {
      errors: true,
      warnings: true,
    },
  },
});

exports.generateSourceMaps = function({ type }) {
  return {
    devtool: type,
  };
};

exports.clean = function(loc) {
  console.log(loc);
  return {
    plugins: [
      new CleanWebpackPlugin([loc], { root: path.resolve(__dirname , '../../../'), verbose: true }),
    ],
  };
};

exports.minifyJavaScript = function({ useSourceMap }) {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: useSourceMap,
      }),
    ],
  };
};

