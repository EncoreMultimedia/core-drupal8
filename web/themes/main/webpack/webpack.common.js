const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const glob = require('glob');
const css = require('./parts/css');
const js = require('./parts/js');
const img = require('./parts/images');

const PATHS = {
  assets: path.join(__dirname, '/../assets'),
  public: path.join(__dirname, '/../public'),
  styles: glob.sync('/../assets/sass/**/*.scss'),
  base: glob.sync('/../assets/sass/**/*.sass'),
  images: glob.sync('/../assets/images/*')
};

module.exports = merge([
  {
    entry: {
      scripts: PATHS.assets,
      images: PATHS.images,
    },
    output: {
      path: PATHS.public,
      filename: 'js/[name].js',
    },
  },
  js.lintJavaScript({ include: PATHS.assets }),
  css.lintCSS({ include: PATHS.assets }),
  js.loadJavaScript({ include: PATHS.assets }),
]);