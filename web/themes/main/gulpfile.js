'use strict';

const gulp          = require('gulp');
const imagemin      = require('gulp-imagemin');
const sass          = require('gulp-sass');
const postcss       = require('gulp-postcss');
const sourcemaps    = require('gulp-sourcemaps');
const autoprefixer  = require('autoprefixer');
const clone         = require('gulp-clone');
const concat        = require('gulp-concat');
const es            = require('event-stream');
const criticalsplit = require('postcss-critical-split');
const cssnano       = require('cssnano');
const mqpacker      = require('css-mqpacker');
const browserSync   = require('browser-sync').create();
const babel         = require('gulp-babel');
const babili        = require('gulp-babili');
const clean         = require('gulp-clean');
const runSequence   = require('run-sequence');

const AUTOPREFIXER_BROWSERS = {
  browsers: [
    'ie >= 9',
    'safari >= 7',
    'ios >= 7',
    'android >= 4',
  ],
};

const ASSETS = {
  images: './assets/images/**/*',
  sass: './assets/sass/**/*.scss',
  scripts: './assets/js/**/*.js',
};

const PUBLIC = {
  js: './public/js',
  css: './public/css',
  images: './public/images',
  get all() { return [this.js, this.css, this.images]; },
};

gulp.task('clean', () =>
  gulp.src(PUBLIC.all, {read: false})
    .pipe(clean())
);

gulp.task('imagemin', () =>
  gulp.src(ASSETS.images)
      .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 7}),
        imagemin.svgo({plugins: [{
          removeViewBox: false,
          removeEmptyAttrs: true,
        }]}),
      ]))
      .pipe(gulp.dest(PUBLIC.images))
      .pipe(browserSync.stream())
);

gulp.task('sass-build', () => {
  let css = gulp.src(ASSETS.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ autoprefixer(AUTOPREFIXER_BROWSERS) ]));

  let critical = css.pipe(clone())
    .pipe(concat('critical.css'))
    .pipe(postcss([
      criticalsplit({output: 'critical'}),
      //mqpacker({sort: true}),
      cssnano({ reduceIdents: false }),
    ]));

  css.pipe(postcss([
    criticalsplit({output: 'rest'}),
    //mqpacker({sort: true}),
    cssnano({ reduceIdents: false }),
  ]));

  return es.merge(critical, css)
    .pipe(gulp.dest(PUBLIC.css));
});

gulp.task('sass', () =>
  gulp.src(ASSETS.sass)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(AUTOPREFIXER_BROWSERS),
      mqpacker({sort: true}),
      cssnano({ reduceIdents: false }),
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PUBLIC.css))
    .pipe(browserSync.stream({match: '**/*.css'}))
);

gulp.task('js', () =>
  gulp.src(ASSETS.scripts)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env'],
    }))
    .pipe(babili({
      mangle: {
        keepClassNames: true,
      },
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PUBLIC.js))
    .pipe(browserSync.stream({match: '**/*.js'}))
);

gulp.task('build', () =>
  runSequence('clean', ['imagemin', 'sass-build', 'js'])
);

gulp.task('default', () => {
  browserSync.init({
    proxy: 'localhost:9000',
    //reloadDelay: 2000,
    serveStatic: [{
      route: '/themes/basic/public',
      dir: 'public',
    }],
  });

  gulp.watch(ASSETS.sass,['sass']);
  gulp.watch(ASSETS.images,['imagemin']);
  gulp.watch(ASSETS.scripts, ['js']);
});
