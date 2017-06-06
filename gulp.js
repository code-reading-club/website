// gulpfile.js

'use strict';

// 1. Load Plugins
const gulp    = require('gulp')
const bourbon = require('bourbon').includePaths
const neat    = require('bourbon-neat').includePaths
const $       = require('gulp-load-plugins')({
  DEBUG: false,
  pattern: ['gulp-*', 'gulp.*', 'del', 'run-*', 'browser*', 'vinyl-*'],
  rename: {
    'vinyl-source-stream': 'source',
    'vinyl-buffer':        'buffer',
    'gulp-util':           'gutil'
  },
})

// 2. Configuration
const source = 'source/' // The middleman source folder
const dest   = '.tmp/' // The "hot" folder used by the external pipeline

const development = $.environments.development
const production  = $.environments.production

const css = {
  in: source + 'assets/stylesheets/**/*.{css,scss,sass}',
  out: dest + 'assets/stylesheets/'
}

const sassOpts = {
  imagePath: '../assets/images',
  includePaths: [bourbon, neat],
  errLogToConsole: true
}

const autoprefixerOpts = {
  browsers: ['last 3 versions', '> 2%']
}

const js = {
  in: source + 'assets/javascripts/*.js',
  out: dest + 'assets/javascripts'
}

const uglifyOpts = {
  output: {
    comments: 'uglify-save-license'
  }
}

const images = {
  in: source + 'assets/images/*',
  out: dest + 'assets/images/'
}

const serverOpts = {
  proxy: 'localhost:4567',
  open: true,
  reloadDelay: 700,
  files: [dest + '**/*.{js,css}', source + '**/*.{html,haml,markdown}']
}

// 3. Tasks

// CSS Preprocessing
gulp.task('css', () => {
  gulp.src(css.in)
    .pipe(development($.sourcemaps.init()))
    .pipe($.sass(sassOpts).on('error', $.sass.logError))
    .pipe($.autoprefixer(autoprefixerOpts)).on('error', handleError)
    .pipe(production($.cleanCss()))
    .pipe(development($.sourcemaps.write()))
    .pipe(gulp.dest(css.out))
})

// JavaScript Bundling
gulp.task('js', () => {
  var b = $.browserify({
    entries: source + 'assets/javascripts/app.js',
    debug: true
  })

  b.bundle().on('error', handleError)
    .pipe($.source('bundle.js'))
    .pipe(production() ? $.buffer() : $.gutil.noop())
    .pipe(production($.stripDebug()))
    .pipe(production() ? $.uglify(uglifyOpts) : $.gutil.noop())
    .pipe(gulp.dest(js.out))
})

// Image Optimization
gulp.task('images', () => {
  gulp.src(images.in)
    .pipe($.changed(images.out))
    .pipe($.imagemin())
    .pipe(gulp.dest(images.out))
})

// Clean .tmp/
gulp.task('clean', () => {
  $.del([
    dest + '*'
  ])
})

// Asset size report
gulp.task('sizereport', () => {
  gulp.src(dest + '**/*')
    .pipe($.sizereport({
      gzip: true
    }))
})

gulp.task('development', (done) => {
  $.runSequence('clean', 'css', 'js', 'images', done)
})

gulp.task('production', (done) => {
  $.runSequence('clean', 'css', 'js', 'images', 'sizereport', done)
})

// Default Task
// This is the task that is invoked by the external pipeline when
// running `middleman server`
gulp.task('default', ['development'], () => {
  $.browserSync.init(serverOpts)

  gulp.watch(css.in,    ['css'])
  gulp.watch(js.in,     ['js'])
  gulp.watch(images.in, ['images'])
})

function handleError(err) {
  console.log(err.toString())
  this.emit('end')
}
