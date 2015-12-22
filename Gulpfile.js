'use strict';

var gulp = require( 'gulp' ),
g = require( 'gulp-load-plugins' )({
  rename: {
    'gulp-group-css-media-queries': 'cms',
  }
});

var path = {
  scripts: 'assets/scripts'
}

// Styles
gulp.task('concatStyles', function() {
  g.rubySass('assets/sass/style.scss', { style: 'expanded' })
    .pipe(g.if(/[.]css/, g.cms()))
    .pipe(gulp.dest('assets/css'))
    .pipe(g.notify({ message: 'Css complete' }));
});

gulp.task('minStyles', ['concatStyles'], function() {
    return gulp.src('assets/css/*')
      .pipe(g.minifyCss({}))
      .pipe(g.autoprefixer(/[.]css/, g.cms()))
      .pipe(gulp.dest('assets/css'));
});

// Concat Scripts
gulp.task('concatScripts', ['lodash'], function() {
  gulp.src([path.scripts+"/libs/*", path.scripts+"/app.js"])
    .pipe(g.concat('app.js'))
    .pipe(gulp.dest(path.scripts+'/dist/'))
    .pipe(g.notify({ message: 'Concatenated Script' }));
});

// Min Scripts
gulp.task('minScripts', ['lodash'], function() {
  gulp.src([path.scripts+"/libs/*", path.scripts+"/app.js"])
    .pipe(g.concat('app.js'))
    .pipe(g.uglify().on('error', g.util.log))
    .pipe(gulp.dest(path.scripts+'/dist/'))
    .pipe(g.notify({ message: 'Minified Script' }));
});

// Build custom lodash
gulp.task('lodash', function () {
  return gulp.src(path.scripts+"/app.js", {buffer: false})
    .pipe(g.lodashBuilder({
      target: path.scripts+"/libs/lodash.custom.js",
      settings: {}
    }))
});


// Default Task
// gulp.task('default', function() {
//     gulp.start('minStyles', 'minScripts');
// });

// Build
gulp.task('build', function() {
  gulp.start('minStyles', 'minScripts');
});

// Development
gulp.task('dev', function() {
  gulp.start('concatStyles', 'concatScripts', 'watch');
});

// Watch
gulp.task('watch', function() {
  gulp.watch('assets/sass/**/*.scss', ['concatStyles']);
  gulp.watch('assets/scripts/app.js', ['concatScripts']);
  g.livereload.listen();
  gulp.watch(['dist/**']).on('change', g.livereload.changed);
});