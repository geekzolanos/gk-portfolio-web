/* Needed gulp config */

var fs = require('fs');
var gulp = require('gulp');  
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const parseColors = require('./src/js/parseColors');

let payload = {};

/* vendor-js task */
gulp.task('vendor-js', function() {
  return gulp.src([
    /* Add your JS files here, they will be combined in this order */
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/jquery-easing/jquery.easing.1.3.js',
    'node_modules/jquery-countto/jquery.countTo.js',
    'node_modules/jquery.appear/jquery.appear.js',
    'node_modules/magnific-popup/dist/jquery.magnific-popup.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/vanilla-lazyload/dist/lazyload.min.js'
    ])
    .pipe(concat('vendor.js'))
    .pipe(rename({suffix: '.min'}))
    //.pipe(uglify())
    .pipe(gulp.dest('build/scripts'));
});

gulp.task('js', function() {
  return gulp.src(['src/js/main.js', 'src/js/custom.js'])
    .pipe(rename({suffix: '.min'}))
    //.pipe(uglify())
    .pipe(gulp.dest('build/scripts'));
});

/* Sass task */
gulp.task('sass', function () {  
    return gulp.src(['src/scss/vendor.scss', 'src/scss/main.scss'])
        .pipe(plumber())
        .pipe(sass({
            errLogToConsole: true,

            //outputStyle: 'compressed',
            // outputStyle: 'compact',
            // outputStyle: 'nested',
            outputStyle: 'expanded',
            precision: 10
        }))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(rename({suffix: '.min'}))
        //.pipe(minifycss())
        .pipe(gulp.dest('build/style'))
        /* Reload the browser CSS after every change */
        .pipe(reload({stream:true}));
});

const setupPayload = async () => {
    payload = JSON.parse(fs.readFileSync('src/data.json'));
    const pkgs = Object.keys(payload.packages);
    const colors = await parseColors({pkgs});
    payload.colors = colors;
};

gulp.task('html', function() { 
    return gulp.src('src/views/*.njk')
        .pipe(data(payload))
        .pipe(nunjucksRender({path: ['src/views']}))
        .pipe(gulp.dest('build'));
});

/* Reload task */
gulp.task('bs-reload', function (done) {
    browserSync.reload();
    done();
});

/* Prepare Browser-sync for localhost */
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: ["build", 'src']
        }
    });
});

gulp.task('watch', function() {
    /* Watch scss, run the sass task on change. */
    gulp.watch(['src/scss/*.scss', 'src/scss/**/*.scss'], gulp.series('sass', 'bs-reload'));
    /* Watch app.js file, run the vendor-js task on change. */
    gulp.watch(['src/js/main.js'], gulp.series('js', 'bs-reload'));
    /* Watch .html files, run the bs-reload task on change. */
    gulp.watch(['src/views/*.njk', 'src/views/**/*.njk'], gulp.series('html', 'bs-reload'));
});

function clean() {
    return del('build');
}

/* Watch scss, js and html files, doing different things with each. */
gulp.task('default', gulp.series(
    clean,
    setupPayload,
    gulp.parallel('html', 'sass', 'vendor-js', 'js'), 
    gulp.parallel('browser-sync', 'watch')
));