/*eslint-env node */
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
const pump = require('pump');

gulp.task('default', ['copy-html', 'css', 'copy-images', 'scripts'], () => {
  gulp.watch('sass/**/*.scss', ['styles']);
  gulp.watch('js/**/*.js', ['lint']);
  gulp.watch('/index.html', ['copy-html']);

});

gulp.task('dist', [
  'css',
  'copy-html',
  'copy-images',
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

gulp.task('scripts', () => {
  gulp.src('js/**/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./js'));
});

gulp.task('compress', cb => {
  pump([
      gulp.src('js/*.js').pipe(concat('script.min.js')),
      uglify(),
      gulp.dest('./js')
    ],
    cb
  );
});

gulp.task('scripts-dist', () => {
  gulp.src('js/*.js')
    .pipe(uglify())
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest('./js'));
});

gulp.task('copy-html', () => {
  gulp.src('./index.html')
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', () => {
  gulp.src('img/*')
    .pipe(gulp.dest('dist/img'));
});
