/*
 gulpfile.js
 ===========
 Each task has been broken out into its own file in the gulpfile.js/tasks dir.
 Any files in that directory get automatically required below.
*/

var requireDir = require('require-dir')

// Require all tasks in gulpfile.js/tasks including subfolders
requireDir('./tasks', { recurse: true })
