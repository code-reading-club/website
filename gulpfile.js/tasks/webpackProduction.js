var config = require('../config')
if(!config.tasks.js) return

var config  = require('../lib/webpack-multi-config')('production')
const gulp    = require('gulp')
const logger  = require('../lib/compileLogger')
const webpack = require('webpack')

const webpackProductionTask = function(callback) {
  webpack(config, function(err, stats) {
    logger(err, stats)
    callback()
  })
}

gulp.task('webpack:production', webpackProductionTask)
module.exports = webpackProductionTask
