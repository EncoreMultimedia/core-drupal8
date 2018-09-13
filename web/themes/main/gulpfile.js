
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

const ASSETS = {
  images: './assets/images/**/*',
  sass: {
    base: './assets/sass',
    all: './assets/sass/**/*.scss',
    mains: [
      './assets/sass/*.scss',
      './assets/sass/2-nodes/*.scss',
    ],
  },
  scripts: './assets/js/**/*.js',
};

const PUBLIC = {
  js: './public/js',
  css: './public/css',
  images: './public/images',
  get all() { return [this.js, this.css, this.images]; },
};

// Input file.
var bundler = browserify({
  fullPaths: false,
  entries: './assets/js/scripts.js',
  extensions: ['js'],
  insertGlobals : true,
  debug: true,
})
  .transform(babelify, {sourceMapRelative: 'assets/js'})
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
    .pipe(exorcist('./public/build/js/scripts.js.map'))
    .pipe(source('scripts.js'))
    .pipe(gulp.dest('./public/build/js'));
}

function minifyJS() {
  return gulp.src('./public/build/js/*.js')
    .pipe(uglify({output: {beautify: true}}))
    .pipe(gulp.dest(PUBLIC.js))
    .pipe(browserSync.stream({once: true}));
}

function sassdev() {
  return gulp.src(ASSETS.sass.mains, { base: ASSETS.sass.base })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      mqpacker({sort: true}),
      cssnano({ reduceIdents: false, autoprefixer: false, zindex: false }),
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PUBLIC.css))
    .pipe(browserSync.stream({once: true}));
}

function sasswatch() {
  return gulp.watch(ASSETS.sass.all, sassdev);
}

function sassbuild() {
  let css = gulp.src(ASSETS.sass.mains, { base: ASSETS.sass.base })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ autoprefixer() ]));

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
    cssnano({ reduceIdents: false, autoprefixer: false, zindex: false }),
  ]));

  return es.merge(critical, css)
    .pipe(gulp.dest(PUBLIC.css));
}

function minifyImg() {
  return gulp.src(ASSETS.images)
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
    .pipe(gulp.dest(PUBLIC.images))
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
  gulp.watch(ASSETS.images, minifyImg);
  gulp.watch(ASSETS.scripts, gulp.series('bundle', 'uglify', 'clean:build'));
  done();
}

/**
 * Gulp task aliases for CLI use
 */

gulp.task('clean:public', () => del(PUBLIC.all));

gulp.task('clean:build', () => del(['public/build']));

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
