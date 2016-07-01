'use strict';
var gulp = require('gulp');
var path = require('path');

//css
var compass = require('gulp-compass'),
   autoprefixer = require('gulp-autoprefixer'),
   minifycss  = require('gulp-cssnano'),
   gutil = require('gulp-util');

const CSS_BUILD_DIR = path.resolve(__dirname, './public/css');

gulp.task('watch', ['dev'], function() {
   gulp.watch('./src/styles/**/*',  ['dev']);
});
gulp.task('dev', function() {
   return gulp.src('./src/styles/**/*.scss')
      .pipe(compass({
         sass     : './src/styles',
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
   return gulp.src(['./styles/**/*.scss'])
      .pipe(compass({
         sass     : './src/styles',
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
