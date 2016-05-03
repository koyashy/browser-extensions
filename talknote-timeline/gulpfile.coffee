gulp = require 'gulp'
rimraf = require 'rimraf'
babel = require 'gulp-babel'
uglify = require 'gulp-uglify'
cleanCSS = require 'gulp-clean-css'
runSequence = require 'run-sequence'

BUILD_NAME = 'talknote-timeline.safariextension'

gulp.task 'clean', (cb) ->
    rimraf('./build', cb)

gulp.task 'safari', () ->
    gulp.src('src/vender/safari/**')
        .pipe(gulp.dest("build/safari/#{BUILD_NAME}"))
    gulp.src(['src/lib/**',
            'node_modules/babel-polyfill/dist/polyfill.js'])
        .pipe(gulp.dest("build/safari/#{BUILD_NAME}/lib"))
    gulp.src('src/css/**')
        .pipe(cleanCSS())
        .pipe(gulp.dest("build/safari/#{BUILD_NAME}/css"))
    gulp.src('src/js/**')
        .pipe(babel(presets: ['es2015']))
        .pipe(uglify())
        .pipe(gulp.dest("build/safari/#{BUILD_NAME}/js"))

gulp.task 'chrome', () ->
    gulp.src('src/vender/chrome/**')
        .pipe(gulp.dest("build/chrome/#{BUILD_NAME}"))
    gulp.src('src/lib/**')
        .pipe(gulp.dest("build/chrome/#{BUILD_NAME}/lib"))
    gulp.src('src/css/**')
        .pipe(cleanCSS())
        .pipe(gulp.dest("build/chrome/#{BUILD_NAME}/css"))
    gulp.src('src/js/**')
        .pipe(gulp.dest("build/chrome/#{BUILD_NAME}/js"))

gulp.task 'default', (cb) ->
    runSequence('clean', ['safari', 'chrome'], cb)
