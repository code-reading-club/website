const config  = require('../config')
const ghPages = require('gulp-gh-pages')
const gulp    = require('gulp')
const open    = require('open')
const os      = require('os')
const package = require('../../package.json')
const path    = require('path')

const settings = {
  url: package.homepage,
  src: path.join(config.root.dest, '/**/*'),
  ghPages: {
    cacheDir: path.join(os.tmpdir(), package.name)
  }
}

const deployTask = function() {
  gulp.src(settings.src)
  .pipe(ghPages(settings.ghPages))
  .on('end', function(){
    open(settings.url)
  })
}

gulp.task('deploy', ['production'], deployTask)
module.exports = deployTask
