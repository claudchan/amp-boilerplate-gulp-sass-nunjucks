var gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  cssnano = require('gulp-cssnano'),
  autoprefixer = require('autoprefixer'),
  purify = require('gulp-purifycss'),
  fs = require("fs"),
  inject = require('gulp-inject-string'),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload,
  rename = require('gulp-rename'),
  nunjucksRender = require('gulp-nunjucks-render'),
  gulpSequence = require('gulp-sequence');

// BrowserSync tasks
gulp.task('browserSync', function () {
  browserSync.init({
    port: 4500,
    open: true,
    ghostMode: false,
    server: {
      baseDir: 'dist'
    }
  });
});

// Styles tasks
gulp.task('styles', function () {
  return gulp.src('src/sass/app.scss')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions']
      })
    ]))
    .pipe(gulp.dest('src/html/css'))
    .pipe(sass().on('error', sass.logError))
    .pipe(purify(['src/html/**/*.html']))
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions']
      })
    ]))
    .pipe(cssnano())
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(gulp.dest('src/html/css'));
});
// task to inject styles
gulp.task('html', ['styles'], function () {
  var cssContent = fs.readFileSync('src/html/css/app.min.css', 'utf8');
  return gulp.src('src/html/**/*.html')
    .pipe(plumber())
    .pipe(inject.after('<style amp-custom>', cssContent))
    .pipe(gulp.dest('dist'));
});

// Nunjucks tasks
// task to render html
gulp.task('nunjucks:render', function () {
  return gulp.src('src/templates/pages/**/*.+(html|nunjucks)')
    // Renders template with nunjucks
    .pipe(
      nunjucksRender({
        path: ['src/templates']
      })
    )
    // Output files in app folder
    .pipe(gulp.dest('src/html'));
});
gulp.task('nunjucks', function (callback) {
  gulpSequence('nunjucks:render', 'html')(callback)
});

// Run
gulp.task('run', gulpSequence('nunjucks:render', 'styles', 'html', 'watch', 'browserSync'));

// Watch tasks
gulp.task('watch', function () {
  gulp.watch('src/templates/**/*.+(html|nunjucks)', ['waitForNunjucks']);
  gulp.watch('src/sass/**/*.scss', ['waitForStyles']);
  gulp.watch('dist/**/*.html', ['waitForHTML']);
});

gulp.task('waitForNunjucks', ['nunjucks'], function () {
  browserSync.reload();
});

gulp.task('waitForStyles', ['html'], function () {
  browserSync.reload();
});

gulp.task('waitForHTML', function () {
  browserSync.reload();
});

// Gulp default
gulp.task('default', ['run']);

