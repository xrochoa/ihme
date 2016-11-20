/*----------  GULP  ----------*/

const gulp = require('gulp');

/*----------  PLUGINS  ----------*/

//img
const imagemin = require('gulp-imagemin');

//html
const htmlmin = require('gulp-htmlmin');

//css
const sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css');

//js
const eslint = require('gulp-eslint'),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    babelify = require('babelify');

//utils
const del = require('del'),
    runSequence = require('run-sequence'),
    sourcemaps = require('gulp-sourcemaps'),
    gulpif = require('gulp-if'),
    argv = require('yargs').argv,
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');

//server
const browserSync = require('browser-sync').create();

/*----------  CLEAN  ----------*/

//Clean dist folder before tasks
gulp.task('clean', function() {
    return del(['./dist/*']);
});

/*----------  RESOURCES  ----------*/

//Copy files from resources
gulp.task('res', function() {
    return gulp.src('./src/assets/res/**/*')
        .pipe(gulp.dest('./dist/assets/res'))
        .pipe(browserSync.stream());
});

/*----------  HTML  ----------*/

//Minify html
gulp.task('html', function() {
    return gulp.src('./src/**/*.html')
        .pipe(gulpif(argv.production, htmlmin({ collapseWhitespace: true })))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});

/*----------  IMAGES  ----------*/

//Minify png, jpg, gif and svg images
gulp.task('img', function() {
    return gulp.src('./src/assets/img/**/*')
        .pipe(gulpif(argv.production, imagemin()))
        .pipe(gulp.dest('./dist/assets/img'))
        .pipe(browserSync.stream());
});

/*----------  JAVASCRIPT  ----------*/

//Lint
gulp.task('js:lint', function() {
    return gulp.src('./src/assets/js/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format()); //outputs errors
});

//Bundle and minify js
gulp.task('js:bundle', function() {
    return browserify({ entries: './src/assets/js/main.js', extensions: ['.js'], debug: true }) //debug adds sourcemaps
        .transform('babelify', { presets: ['es2015'] })
        .bundle().on('error', function(err) {
            console.log(err.message);
            this.emit('end');
        })
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(gulpif(argv.production, uglify())) //uglify minifies and removes sourcemaps
        .pipe(gulp.dest('./dist/assets/js'))
        .pipe(browserSync.stream());
});

gulp.task('js', ['js:lint', 'js:bundle']);

/*----------  CSS  ----------*/

//Compile scss to css and minify
gulp.task('css', function() {
    return gulp.src('./src/assets/scss/**/style.scss')
        .pipe(gulpif(!argv.production, sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: [
                "Android 2.3",
                "Android >= 4",
                "Chrome >= 20",
                "Firefox >= 24",
                "Explorer >= 8",
                "iOS >= 6",
                "Opera >= 12",
                "Safari >= 6"
            ],
            cascade: false
        }))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulpif(!argv.production, sourcemaps.write('.')))
        .pipe(gulp.dest('./dist/assets/css'))
        .pipe(browserSync.stream());
});


/*----------  WATCH  ----------*/


//Watches Files For Changes
gulp.task('watch', function() {

    browserSync.init({
        server: {
            baseDir: './dist'
        },
        open: false,
        port: 3000,
        notify: {
            styles: {
                top: 'auto',
                bottom: '0'
            }
        }
    });

    gulp.watch('src/assets/res/**/*', ['res']);
    gulp.watch('src/assets/img/**/*', ['img']);
    gulp.watch('src/**/*.html', ['html']);
    gulp.watch('src/assets/scss/**/*.scss', ['css']);
    gulp.watch('src/assets/js/**/*.js', ['js']);
});

/*----------  DEFAULT  ----------*/

// Default Task
gulp.task('default', function() {
    runSequence('clean', 'res', 'img', 'html', 'css', 'js', 'watch');
});
