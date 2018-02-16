const gulp          = require('gulp');
const gutil         = require('gulp-util');
const source        = require('vinyl-source-stream');
const babelify      = require('babelify');
const watchify      = require('watchify');
const exorcist      = require('exorcist');
const browserify    = require('browserify');
const browserSync   = require('browser-sync').create();
const uglify        = require("gulp-uglify");
const runSequence   = require('run-sequence');
const clean         = require('gulp-clean');
const sass          = require('gulp-sass');
const postcss       = require('gulp-postcss');
const sourcemaps    = require('gulp-sourcemaps');
const autoprefixer  = require('autoprefixer');
const mqpacker      = require('css-mqpacker');
const cssnano       = require('cssnano');
const criticalsplit = require('postcss-critical-split');
const clone         = require('gulp-clone');
const concat        = require('gulp-concat');
const es            = require('event-stream');
const imagemin      = require('gulp-imagemin');

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



// Watchify args contains necessary cache options to achieve fast incremental bundles.
// See watchify readme for details. Adding debug true for source-map generation.
watchify.args.debug = true;
// Input file.
var bundler =browserify({
  // Required watchify args
  cache: {}, packageCache: {}, fullPaths: false,
  // Browserify Options
  entries: ['./assets/js/scripts.js'],
  extensions: ['js'],
  insertGlobals : true,
  debug: true
});

// Babel transform
bundler.transform(babelify.configure({
  sourceMapRelative: 'assets/js'
}));

// On updates recompile
bundler.on('update', bundle);

function bundle() {

  gutil.log('Compiling JS...');

  return bundler.bundle()
    .on('error', function (err) {
      gutil.log(err.message);
      browserSync.notify("Browserify Error!");
      this.emit("end");
    })
    .pipe(exorcist('./public/build/js/scripts.js.map'))
    .pipe(source('scripts.js'))
    .pipe(gulp.dest('./public/build/js'))
}


/**
 * Gulp task alias
 */

gulp.task('clean:public', () =>
  gulp.src(PUBLIC.all, {read: false})
    .pipe(clean())
);

gulp.task('clean:build', () => {
  gulp.src('public/build', {read: false})
    .pipe(clean())
});

gulp.task('bundle', function () {
  return bundle();
});

gulp.task('uglify', function() {
  gulp.src('./public/build/js/*.js')
    .pipe(uglify('scripts.min.js', {output: {
      beautify: true
    }}))
    .pipe(gulp.dest('public/js/'))
    .pipe(browserSync.stream({once: true}));
});

gulp.task('sass:watch', () =>
  gulp.src(ASSETS.sass)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(AUTOPREFIXER_BROWSERS),
      mqpacker({sort: true}),
      cssnano({ reduceIdents: false, autoprefixer: false }),
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PUBLIC.css))
    .pipe(browserSync.stream({once: true}))
);

gulp.task('sass:build', () => {
  let css = gulp.src(ASSETS.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ autoprefixer(AUTOPREFIXER_BROWSERS) ]));

  let critical = css.pipe(clone())
    .pipe(concat('critical.css'))
    .pipe(postcss([
      criticalsplit({output: 'critical'}),
      //mqpacker({sort: true}),
      cssnano({ reduceIdents: false, autoprefixer: false }),
    ]));

  css.pipe(postcss([
    criticalsplit({output: 'rest'}),
    //mqpacker({sort: true}),
    cssnano({ reduceIdents: false, autoprefixer: false }),
  ]));

  return es.merge(critical, css)
    .pipe(gulp.dest(PUBLIC.css));
});

gulp.task('imagemin', () => {
    return gulp.src('assets/images/**/*')
      .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 7}),
        imagemin.svgo({
          plugins: [{
            removeViewBox: false,
            removeEmptyAttrs: true,
          }]
        }),
      ]))
      .pipe(gulp.dest(PUBLIC.images))
      .pipe(browserSync.stream())
  }
);

/**
 * First bundle, then serve from the ./app directory
 */
gulp.task('default', () => {
  browserSync.init({
    proxy: 'core8.lndo.site',
    injectChanges: true,
    //reloadDelay: 2000,
    serveStatic: [{
      route: '/themes/main/public',
      dir: 'public',
    }],
  });

  gulp.watch(ASSETS.sass,['sass:watch']);
  gulp.watch('assets/images/**/*',['imagemin']);
  gulp.watch(ASSETS.scripts,() => runSequence('bundle','uglify', 'clean:build'));
});

gulp.task('build', () =>
  runSequence('clean:public','bundle','uglify', 'sass:build', 'imagemin','clean:build')
);
