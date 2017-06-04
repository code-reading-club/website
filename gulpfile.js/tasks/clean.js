const gulp = require('gulp')
const del = require('del')
const config = require('../config')

const cleanTask = function (cb) {
  del([config.root.dest]).then(function (paths) {
    cb()
  })
}

gulp.task('clean', cleanTask)
module.exports = cleanTask
