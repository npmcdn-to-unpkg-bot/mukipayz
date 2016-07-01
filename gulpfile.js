'use strict';
var gulp = require('gulp');
var path = require('path');

//css
var compass = require('gulp-compass'),
   autoprefixer = require('gulp-autoprefixer'),
   minifycss  = require('gulp-cssnano'),
   gutil = require('gulp-util');


const CSS_BUILD_DIR = path.resolve(__dirname, './public/css');
const CSS_SOURCE_DIR = './styles/**/*.scss';


gulp.task('watch', ['dev'], function() {
   gulp.watch(CSS_SOURCE_DIR,  ['dev']);
});
gulp.task('dev', function() {
   return gulp.src(CSS_SOURCE_DIR)
      .pipe(compass({
        sass     : './styles',
        css      : CSS_BUILD_DIR,
        logging  : true,
        comments : true,
      }))
      .on('error', function(err) {
         gutil.log("[production]", err.toString());
         this.emit('end');
      })
      .pipe(autoprefixer())
      .pipe(gulp.dest(CSS_BUILD_DIR));
});
gulp.task('production', function() {
   return gulp.src([CSS_SOURCE_DIR])
      .pipe(compass({
         sass     : './styles',
         css      : CSS_BUILD_DIR,
         logging  : false,
         comments : false,
         style    : 'compressed'
      }))
      .on('error', function(err) {
         gutil.log("[production]", err.toString());
      })
      .pipe(autoprefixer())
      .pipe(minifycss())
      .pipe(gulp.dest(CSS_BUILD_DIR));
});
