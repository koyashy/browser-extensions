gulp = require 'gulp'
rimraf = require 'rimraf'
babel = require 'gulp-babel'
uglify = require 'gulp-uglify'
cleanCSS = require 'gulp-clean-css'
runSequence = require 'run-sequence'

path =
    src:
        safari: 'src/vender/safari/**'
        chrome: 'src/vender/chrome/**'
        lib: 'src/lib/**'
        css: 'src/css/**'
        js: 'src/js/**'
    build:
        safari: 'build/safari/talknote-timeline.safariextension'
        chrome: 'build/chrome/talknote-timeline.safariextension'

gulp.task 'clean', (cb) ->
    rimraf('./build', cb)

gulp.task 'safari', () ->
    gulp.src(path.src.safari)
        .pipe(gulp.dest(path.build.safari))
    gulp.src([path.src.lib,
            'node_modules/babel-polyfill/dist/polyfill.js'])
        .pipe(gulp.dest("#{path.build.safari}/lib"))
    gulp.src(path.src.css)
        .pipe(cleanCSS())
        .pipe(gulp.dest("#{path.build.safari}/css"))
    gulp.src(path.src.js)
        .pipe(babel(presets: ['es2015']))
        .pipe(uglify())
        .pipe(gulp.dest("#{path.build.safari}/js"))

gulp.task 'chrome', () ->
    gulp.src(path.src.chrome)
        .pipe(gulp.dest(path.build.chrome))
    gulp.src(path.src.lib)
        .pipe(gulp.dest("#{path.build.chrome}/lib"))
    gulp.src(path.src.css)
        .pipe(cleanCSS())
        .pipe(gulp.dest("#{path.build.chrome}/css"))
    gulp.src(path.src.js)
        .pipe(gulp.dest("#{path.build.chrome}/js"))

gulp.task 'watch', () ->
    gulp.watch 'src/**', ['safari', 'chrome']

gulp.task 'build', (cb) ->
    runSequence('clean', ['safari', 'chrome'], cb)

gulp.task 'default', ['build']
