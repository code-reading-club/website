// Load All Gulp Plugins
const gulp         = require('gulp')
const $            = require('gulp-load-plugins')()
const argv         = require('yargs').argv
const autoprefixer = require('autoprefixer')
const babelify     = require('babelify')
const browserSync  = require('browser-sync')
const browserify   = require('browserify')
const buffer       = require('vinyl-buffer')
const del          = require('del')
const exec         = require('child_process').exec
const fs           = require('fs')
const gulpif       = require('gulp-if')
const gulpsync     = require('gulp-sync')(gulp);
const gutil        = require('gulp-util')
const imagemin     = require('gulp-imagemin')
const jshint       = require('gulp-jshint')
const lodash       = require('lodash')
const notify       = require('gulp-notify')
const postcss      = require('gulp-postcss')
const sass         = require('gulp-sass')
const source       = require('vinyl-source-stream')
const sourcemaps   = require('gulp-sourcemaps')
const stylish      = require('jshint-stylish')
const uglify       = require('gulp-uglify')
const watchify     = require('watchify')

const production   = !!argv.production

const build        = argv._.length ? argv._[0] === 'build' : false
const watch        = argv._.length ? argv._[0] === 'watch' : true

const reload       = browserSync.reload

const paths = {
  scripts: {
    main:   ['source/assets/javascripts/application.js'],
    listen: ['source/assets/javascripts/**/*.js'],
    out:    'source/javascripts'
  },
  stylesheets: {
    main:   ['source/assets/stylesheets/application.sass'],
    listen: ['source/assets/stylesheets/**/*.sass'],
    out:    'source/stylesheets'
  },
  images: {
    main:   ['source/assets/images/**/*'],
    listen: ['source/assets/images/**/*'],
    out:    'source/images'
  }
}

const handleError = function(task) {
  return (err) => {
    notify.onError({
      message: task + ' failed, check the logs.',
      sound: false
    })(err)
    gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err))
  }
}

const tasks = {
  sass: () => {
    gulp.src(paths.stylesheets.main)
    .pipe(gulpif(!production, sourcemaps.init()))
      .pipe(sass({
        sourceComments: !production,
        outputStyle: production ? 'compressed' : 'nested'
      }))
      .on('error', sass.logError)
      .pipe(gulpif(!production, sourcemaps.write({
        'includeContent': false,
        'sourceRoot': '.'
      })))
      .pipe(gulpif(!production, sourcemaps.init({
        'loadMaps': true
      })))
      .pipe(postcss([autoprefixer({browsers: ['last 2 versions', '> 2%']})]))
      .pipe(sourcemaps.write({
        'includeContent': true
      }))
      .pipe(gulp.dest(paths.stylesheets.out))
      .pipe(browserSync.stream())
  },
  images: () => {
    gulp.src(paths.images.main)
      .on('error', handleError('images'))
      .pipe(gulp.dest(paths.images.out))
  },
  browserify: () => {
    var bundler = browserify(paths.scripts.main, {
      debug: !production,
      cache: {}
    })
    bundler.transform('babelify', {presets: ["es2015"]})
    var build = argv._.length ? argv._[0] === 'build' : false
    if (watch) {
      bundler = watchify(bundler)
      bundler = bundler
      .on('update', (time) => {
        $.util.log('Rebuilding scripts')
      })
      .on('log', (msg) => {
        $.util.log(msg)
      })
    }
    var rebundle = () => {
      bundler.bundle()
      .on('error', handleError('Browserify'))
      .pipe(source('application.js'))
      .pipe(gulpif(production, buffer()))
      .pipe(gulpif(production, uglify()))
      .pipe(gulp.dest(paths.scripts.out))
      .pipe(reload({stream:true}))
    }
    bundler.on('update', rebundle)
    return rebundle()
  },
  lintjs: () => {
    return gulp.src([
      'gulpfile.js',
      paths.scripts.main,
      paths.scripts.listen
    ])
      .pipe(jshint({ esversion: 6 }))
      .pipe(jshint.reporter(stylish))
      .on('error', function() {
        beep()
      })
  },
  optimize: () => {
    return gulp.src(paths.images.out)
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        optimizationLevel: production ? 3 : 1
      }))
      .pipe(gulp.dest(paths.images.out))
  }
}

gulp.task('browser-sync', () => {
  browserSync.init({
    proxy: 'localhost:4567'
  })
})

gulp.task('reload-sass',     ['sass'])
gulp.task('reload-js',       ['browserify'], () => { browserSync.reload() })
gulp.task('reload-images',   gulpsync.sync(['optimize', 'images']), () => {
  browserSync.reload()
})

gulp.task('runserver',       tasks.runserver)
gulp.task('sass',            tasks.sass)
gulp.task('browserify',      tasks.browserify)
gulp.task('lint:js',         tasks.lintjs)
gulp.task('images',          tasks.images)
gulp.task('optimize',        tasks.optimize)

gulp.task('watch',
  gulpsync.sync([
    'browser-sync',
    ['images'],
    ['sass', 'browserify'],
  ]), () => {
    gulp.watch(paths.stylesheets.listen, ['reload-sass'])
    gulp.watch(paths.scripts.listen,     ['lint:js'])
    gulp.watch(paths.images.listen,      ['reload-images'])
    gutil.log(gutil.colors.bgGreen('Watching for changes...'))
})

gulp.task('default', ['watch'], () => {
  browserSync.reload()
})

gulp.task('build',
  gulpsync.sync([
    ['images'],
    'optimize',
    'sass',
    'browserify'
  ])
)
