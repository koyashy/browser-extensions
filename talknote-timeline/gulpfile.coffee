gulp = require 'gulp'
rimraf = require 'rimraf'
babel = require 'gulp-babel'
uglify = require 'gulp-uglify'
cleanCSS = require 'gulp-clean-css'
runSequence = require 'run-sequence'
fs = require 'graceful-fs'
template = require 'gulp-template'
plumber = require 'gulp-plumber'

path =
    src:
        dir: './src'
        safari: './src/vender/safari'
        chrome: './src/vender/chrome'
        lib: './src/lib/**'
        css: './src/css/**'
        js: './src/js/**'
    build:
        dir: './build'
        safari: './build/safari'
        chrome: './build/chrome'
        extension: 'talknote-timeline.safariextension'

getVersions = () ->
    version = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version
    [_, major, minor, patch, ...] = version.match(/(\d+)\.(\d+)\.(\d+)/)
    # 各バージョン番号が2桁を超えることはないだろう
    bundleVersion = major * 10000 + minor * 100 + patch * 1
    {version, bundleVersion}

gulp.task 'clean', (cb) ->
    rimraf("#{path.build.dir}", cb)

gulp.task 'safari', () ->
    # vender
    gulp.src ["#{path.src.safari}/**", "!#{path.src.safari}/Info.plist"]
        .pipe gulp.dest("#{path.build.safari}/#{path.build.extension}")
    # config
    versions = getVersions()
    gulp.src "#{path.src.dir}/updates.plist"
        .pipe template(versions)
        .pipe gulp.dest("#{path.build.safari}")
    gulp.src "#{path.src.safari}/Info.plist"
        .pipe template(versions)
        .pipe gulp.dest("#{path.build.safari}/#{path.build.extension}")
    # lib
    gulp.src [path.src.lib,
             'node_modules/babel-polyfill/dist/polyfill.js']
        .pipe gulp.dest("#{path.build.safari}/#{path.build.extension}/lib")
    # css
    gulp.src path.src.css
        .pipe plumber()
        .pipe cleanCSS()
        .pipe gulp.dest("#{path.build.safari}/#{path.build.extension}/css")
    # js
    gulp.src path.src.js
        .pipe plumber()
        .pipe babel(presets: ['es2015'])
        .pipe uglify()
        .pipe gulp.dest("#{path.build.safari}/#{path.build.extension}/js")

gulp.task 'chrome', () ->
    # vender
    gulp.src ["#{path.src.chrome}/**", "!#{path.src.chrome}/manifest.json"]
        .pipe gulp.dest("#{path.build.chrome}/#{path.build.extension}")
    # config
    versions = getVersions()
    gulp.src "#{path.src.dir}/updates.xml"
        .pipe template(versions)
        .pipe gulp.dest("#{path.build.chrome}")
    gulp.src "#{path.src.chrome}/manifest.json"
        .pipe template(versions)
        .pipe gulp.dest("#{path.build.chrome}/#{path.build.extension}")
    # lib
    gulp.src path.src.lib
        .pipe gulp.dest("#{path.build.chrome}/#{path.build.extension}/lib")
    # css
    gulp.src path.src.css
        .pipe plumber()
        .pipe cleanCSS()
        .pipe gulp.dest("#{path.build.chrome}/#{path.build.extension}/css")
    # js
    gulp.src path.src.js
        .pipe plumber()
        .pipe gulp.dest("#{path.build.chrome}/#{path.build.extension}/js")

gulp.task 'watch', () ->
    gulp.watch "#{path.src.dir}/**", ['safari', 'chrome']

gulp.task 'build', (cb) ->
    runSequence('clean', ['safari', 'chrome'], cb)

gulp.task 'default', ['build']
