var gulp = require('gulp'),
    jshint = require('gulp-jshint');
    nodemon = require('gulp-nodemon');


gulp.task('lint', function(){
    return gulp.src(['O365-PROJECT/**/*.js'])
               .pipe(jshint())
               .pipe(jshint.reporter())
               .pipe(jshint.reporter('fail'));
});

gulp.task('develop', function () {
  var stream = nodemon({ script: 'app.js'
          , ext: 'html js'
          , ignore: ['ignored.js']
          , tasks: ['lint'] })

  stream
      .on('restart', function () {
        console.log('restarted!')
      })
      .on('crash', function() {
        console.error('Application has crashed!\n')
         stream.emit('restart', 10)  // restart the server in 10 seconds
      })
})

gulp.task('default', ['lint', 'develop'], function() {
  // place code for your default task here
});
