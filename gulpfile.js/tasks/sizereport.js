const config       = require('../config')
const gulp         = require('gulp')
const repeatString = require('../lib/repeatString')
const sizereport   = require('gulp-sizereport')

gulp.task('size-report', function() {
  gulp.src([config.root.dest + '/**/*', '*!rev-manifest.json'])
    .pipe(sizereport({
      gzip: true
    }))
})
