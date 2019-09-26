'use strict';

var gulp = require('gulp');
var gulpSass = require('gulp-sass');
var gulpRename = require('gulp-rename');

function buildProductScss(_done) {
  return gulp.src('./src/app/features/products/product/product.component.scss')
    .pipe(gulpSass({outputStyle: 'compressed'}).on('error', gulpSass.logError))
    .pipe(gulpRename('product-catalog.min.css'))
    .pipe(gulp.dest('./dist'));
}

gulp.task('buildProductScss', buildProductScss);
gulp.task('default', gulp.series('buildProductScss'));
