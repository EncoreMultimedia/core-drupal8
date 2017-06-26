const path = require('path');
const merge = require('webpack-merge');
const parts = require('./webpack.parts.js');
const glob = require('glob');

const PATHS = {
  assets: path.join(__dirname, '/../assets'),
  public: path.join(__dirname, '/../public'),
  styles: glob.sync('/../assets/sass/**/*.scss'),
  base: glob.sync('/../assets/sass/**/*.sass'),
  images: glob.sync('/../assets/images/*')
};

const commonConfig = merge([
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
  parts.lintJavaScript({ include: PATHS.assets }),
  parts.lintCSS({ include: PATHS.assets }),
  parts.loadJavaScript({ include: PATHS.assets }),
]);

const productionConfig = merge([
  {
    performance: {
      hints: 'warning', // 'error' or false are valid too
      maxEntrypointSize: 100000, // in bytes
      maxAssetSize: 450000, // in bytes
    },
  },
  parts.clean(PATHS.public),
  parts.minifyJavaScript({ useSourceMap: false }),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // Run cssnano in safe mode to avoid
      // potentially unsafe transformations.
      safe: true,
    },
  }),
  parts.generateSourceMaps({ type: 'source-map' }),
  parts.extractCSS({ use: [
    {loader: 'css-loader', options:{importLoaders: 3, sourceMap: true}},
    'resolve-url-loader',
    parts.autoprefix(),
    'sass-loader?sourceMap',

  ]}),

  parts.loadImages({
    options: {
      limit: 15000,
      name: '[name].[ext]',
      publicPath: '../',
      outputPath: '/images/',
      query: {
        progressive: true,
        gifsicle: {
          interlaced: false,
        },
        mozjpeg: {
          quality: 70,
          progressive: true,
        },
        optipng: {
          optimizationLevel: 7,
        },
        svgo: {
          plugins: [
            {
              removeViewBox: false,
            },
            {
              removeEmptyAttrs: true,
            },
          ],
        },
      },
    },
  }),
]);

const developmentConfig = merge([
  {
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  parts.generateSourceMaps({ type: 'cheap-module-eval-source-map' }),
  parts.clean(PATHS.public+'/css'),
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages(),
]);

module.exports = (env) => {
  process.env.BABEL_ENV = env;
  if (env === 'production') {
    return merge(commonConfig, productionConfig);
  }

  return merge(commonConfig, developmentConfig);
};