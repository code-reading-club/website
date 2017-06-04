if (global.production) return

const browserSync        = require('browser-sync')
const gulp               = require('gulp')
const webpack            = require('webpack')
const webpackMultiConfig = require('../lib/webpack-multi-config')
const config             = require('../config')
const pathToUrl          = require('../lib/pathToUrl')

const browserSyncTask = function() {
  var webpackConfig = webpackMultiConfig('development')
  var compiler      = webpack(webpackConfig)
  var proxyConfig   = config.tasks.browserSync.proxy || null;

  if (typeof(proxyConfig) === 'string') {
    config.tasks.browserSync.proxy = {
      target: proxyConfig
    }
  }

  var server = config.tasks.browserSync.proxy || config.tasks.browserSync.server;

  server.middleware = [
    require('webpack-dev-middleware')(compiler, {
      stats: 'errors-only',
      publicPath: pathToUrl('/', webpackConfig.output.publicPath)
    }),
    require('webpack-hot-middleware')(compiler)
  ]

  browserSync.init(config.tasks.browserSync)
}

gulp.task('browserSync', browserSyncTask)
module.exports = browserSyncTask
