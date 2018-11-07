
const autoprefixer  = require('autoprefixer');
const babelify      = require('babelify');
const browserSync   = require('browser-sync').create();
const browserify    = require('browserify');
const mqpacker      = require('css-mqpacker');
const cssnano       = require('cssnano');
const del           = require('del');
const es            = require('event-stream');
const exorcist      = require('exorcist');
const gulp          = require('gulp');
const clone         = require('gulp-clone');
const concat        = require('gulp-concat');
const imagemin      = require('gulp-imagemin');
const postcss       = require('gulp-postcss');
const sass          = require('gulp-sass');
const sourcemaps    = require('gulp-sourcemaps');
const uglify        = require('gulp-uglify');
const criticalsplit = require('postcss-critical-split');
const source        = require('vinyl-source-stream');

const PATHS = {
  source: {
    base: './assets',
    sass: {
      base: '/sass',
      get all() { return this.base + '/**/*.scss'; },
      get mains() { return [
        this.base + '/*.scss',
        this.base + '/2-nodes/*.scss',
      ]; },
    },
    js: {
      base: '/js',
      get all() { return this.base + '/**/*.js'; },
    },
    get images() { return this.base + '/images/**/*'; }
  },
  output: {
    base: './public/build',
    get js() { return this.base + '/js'; }
  },
  outputMinified: {
    base: './public',
    get js() { return this.base + '/js'; },
    get css() { return this.base + '/css'; },
    get images() { return this.base + '/images'; },
    get all() { return [this.js, this.css, this.images]; }
  },
  jsMain: 'scripts.js',

  init: function() {
    this.source.sass.base = this.source.base + this.source.sass.base;
    this.source.js.base = this.source.base + this.source.js.base;
    delete this.init;
    return this;
  }
}.init();

// Input file.
var bundler = browserify({
  fullPaths: false,
  entries: PATHS.source.js.base + '/' + PATHS.jsMain,
  extensions: ['js'],
  insertGlobals : true,
  debug: true,
})
  .transform(babelify)
  // On updates recompile
  .on('update', bundle);

/**
 * Functions called by tasks
 */

function bundle() {
  console.log('Compiling JS...');

  return bundler.bundle()
    .on('error', function (err) {
      console.log(err.message);
      browserSync.notify('Browserify Error!');
      this.emit('end');
    })
    .pipe(exorcist(PATHS.output.js + '/' + PATHS.jsMain + '.map'))
    .pipe(source(PATHS.jsMain))
    .pipe(gulp.dest(PATHS.output.js));
}

function minifyJS() {
  return gulp.src(PATHS.output.js + '/*.js')
    .pipe(uglify({output: {beautify: true}}))
    .pipe(gulp.dest(PATHS.outputMinified.js))
    .pipe(browserSync.stream({once: true}));
}

function sassdev() {
  return gulp.src(PATHS.source.sass.mains, { base: PATHS.source.sass.base })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      mqpacker({sort: true}),
      cssnano(),
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.outputMinified.css))
    .pipe(browserSync.stream({once: true}));
}

function sasswatch() {
  return gulp.watch(PATHS.source.sass.all, sassdev);
}

function sassbuild() {
  let css = gulp.src(PATHS.source.sass.mains, { base: PATHS.source.sass.base })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ autoprefixer() ]));

  let critical = css.pipe(clone())
    .pipe(concat('critical.css'))
    .pipe(postcss([
      criticalsplit({output: 'critical'}),
      //mqpacker({sort: true}),
      cssnano(),
    ]));

  css.pipe(postcss([
    criticalsplit({output: 'rest'}),
    //mqpacker({sort: true}),
    cssnano(),
  ]));

  return es.merge(critical, css)
    .pipe(gulp.dest(PATHS.outputMinified.css));
}

function minifyImg() {
  return gulp.src(PATHS.source.images)
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 7}),
      imagemin.svgo({
        plugins: [{
          removeViewBox: false,
          removeEmptyAttrs: true,
        }],
      }),
    ]))
    .pipe(gulp.dest(PATHS.outputMinified.images))
    .pipe(browserSync.stream());
}

function startDev(done) {
  /**
   * First bundle, then serve from the ./app directory
   */
  browserSync.init({
    proxy: 'core8.lndo.site',
    injectChanges: true,
    //reloadDelay: 2000,
    serveStatic: [{
      route: '/themes/main/public',
      dir: 'public',
    }],
  });

  sasswatch();
  gulp.watch(PATHS.source.images, minifyImg);
  gulp.watch(PATHS.source.js.all, gulp.series('bundle', 'uglify', 'clean:build'));
  done();
}

/**
 * Gulp task aliases for CLI use
 */

gulp.task('clean:public', () => del(PATHS.outputMinified.all));

gulp.task('clean:build', () => del([PATHS.output.base]));

gulp.task('bundle', bundle);

gulp.task('uglify', minifyJS);

gulp.task('sass', sassdev);

gulp.task('sass:watch', sasswatch);

gulp.task('sass:build', sassbuild);

gulp.task('imagemin', minifyImg);

gulp.task('default', startDev);

gulp.task('build',
  gulp.series('clean:public', 'bundle', 'uglify', 'sass:build', 'imagemin', 'clean:build')
);
