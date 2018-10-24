/*eslint-env node */
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
const pump = require('pump');

gulp.task('default', ['css', 'scripts'], () => {
  gulp.watch('js/*.js', ['lint']);
});

gulp.task('dist', [
  'css',
  'scripts-dist'
]);

gulp.task('css', () => {
  gulp.src('./css/styles.css')
    .pipe(uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }))
    .pipe(concat('styles.min.css'))
    .pipe(gulp.dest('./css'));
});

gulp.task('scripts-dist', () => {
  gulp.src('js/*.js')
    .pipe(uglify())
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest('./js'));
});

