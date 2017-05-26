const gulp         = require('gulp')
const del          = require('del')

// Styles Related
const autoprefixer = require('autoprefixer')
const postcss      = require('gulp-postcss')
const sass         = require('gulp-sass')
const cssnano      = require('cssnano')
const mqpacker     = require('css-mqpacker')
const cssmin       = require('gulp-cssmin')
const rename       = require('gulp-rename')
const sourcemaps   = require('gulp-sourcemaps')
const runSequence  = require('run-sequence')
const touch        = require('gulp-touch')
const exec         = require('child_process').exec
const browserSync  = require('browser-sync').create()

const devBuild     = (process.env.NODE_NEV !== 'production')

const source = {
  styles:  ['source/stylesheets/**/*.scss'],
  scripts: ['source/javascripts/**/*.js'],
  images:  ['source/images/**/*']
}

const buildDir = 'build'
const dist = {
  all: [buildDir   + '/**/*'],
  css: buildDir    + '/stylesheets/',
  js: buildDir     + '/js/',
  images: buildDir + '/images/',
}

gulp.task('default', (callback) => {
  runSequence('clean', 'styles', ['watch'], callback)
})

gulp.task('buildProd', (callback) => {
  runSequence('clean', 'styles', callback)
})

gulp.task('clean', () =>
  del(['build/**'])
)

gulp.task('touchConfig', () => {
  gulp.src('config.rb').pipe(touch()) // Touch config.rb on gulpfile.js save so Middleman restarts everything.
})

gulp.task('styles', () => {
  const cssOptions = [
    autoprefixer({browsers: ['last 3 versions', '> 2%']}),
    mqpacker
  ]

  if (!devBuild) {
    cssOptions.push(cssnano)
  }

  gulp.src(source.styles)
    .pipe(sourcemaps.init())
    .pipe(sass.sync({
      outputStyle: 'nested',
      imagePath: 'images/',
      precision: 3,
    }).on('error', sass.logError))
    .pipe(postcss(cssOptions))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('maps/'))
    .pipe(gulp.dest(dist.css))
    .pipe(browserSync.stream())
  }
)

gulp.task('styles:watch', () =>
  gulp.watch('source/assets/styles/**/*.scss', ['styles'])
)

gulp.task('watch', ['styles:watch'])

gulp.task('browserSync', ['styles'], () =>
  browserSync.init({
    server: {
      proxy: 'localhost:4567'
    }
  })
)

gulp.task('build', (cb) => {
  exec('bundle exec middleman build', (err) => {
    if (err) return cb(err);
    cb()
  })
})

gulp.task('serve', (cb) => {
  exec('bundle exec middleman serve', (err) => {
    if (err) return cb(err);
    cb()
  })
})

gulp.task('default', ['build', 'serve', 'browserSync', 'watch'])
