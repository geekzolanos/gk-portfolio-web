const fs = require('fs'),
      gulp = require('gulp'),
      sass = require('gulp-sass'),
      uglify = require('gulp-uglify'),
      rename = require('gulp-rename'),
      cleanCSS = require('gulp-clean-css'),
      concat = require('gulp-concat'),
      plumber = require('gulp-plumber'),
      nunjucksRender = require('gulp-nunjucks-render'),
      data = require('gulp-data'),
      browserSync = require('browser-sync'),
      reload = browserSync.reload,
      sourcemaps = require('gulp-sourcemaps'),
      autoprefixer = require('gulp-autoprefixer'),
      del = require('del'),
      mergeStream = require('merge-stream'),
      parseColors = require('./src/js/build/parseColors');

const LIBS_VENDOR = [
    /* Add your JS files here, they will be combined in this order */
    'node_modules/turbolinks/dist/turbolinks.js',
    'node_modules/turbolinks-animate/src/index.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/jquery-easing/jquery.easing.1.3.js',
    'node_modules/jquery-countto/jquery.countTo.js',
    'node_modules/popper.js/dist/umd/popper.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/muuri/dist/muuri.min.js',
    'node_modules/vanilla-lazyload/dist/lazyload.min.js',
    'node_modules/aos/dist/aos.js',
    'node_modules/slim-select/dist/slimselect.min.js',
    'node_modules/swiper/js/swiper.min.js',
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js',
    'node_modules/particles.js/particles.js',
    'node_modules/lottie-web/build/player/lottie_light.min.js',
    'src/js/vendor/lodash.debounce.min.js',
];

// CSS Files not mergeable using @import scss directive
const CSS_VENDOR = [
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css'
];

let payload = {};

function vendorJs() {
  return gulp.src(LIBS_VENDOR)
    .pipe(concat('vendor.js'))
    .pipe(rename({suffix: '.min'}))
    //.pipe(uglify())
    .pipe(gulp.dest('build/scripts'));
}

gulp.task('js', function() {
  return gulp.src(['src/js/main.js'])
    .pipe(rename({suffix: '.min'}))
    //.pipe(uglify())
    .pipe(gulp.dest('build/scripts'));
});

/* Sass task */
function styles() { 
    return gulp.src('src/scss/main.scss')
        .pipe(plumber())
        .pipe(sass({
            errLogToConsole: true,
            // outputStyle: 'compressed',
            // outputStyle: 'compact',
            // outputStyle: 'nested',
            outputStyle: 'expanded',
            precision: 10
        }))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())        
        .pipe(rename({suffix: '.min'}))
        //.pipe(cleanCSS())
        .pipe(gulp.dest('build/style'))
        /* Reload the browser CSS after every change */
        .pipe(reload({stream:true}));
}

function vendorStyles() {
    const sassStyles = gulp.src('src/scss/vendor.scss')
        .pipe(sass({
            outputStyle: 'compact',
            errLogToConsole: true,
            precision: 10
        }));

    return mergeStream(gulp.src(CSS_VENDOR), sassStyles)
        .pipe(concat('vendor.min.css'))
        .pipe(gulp.dest('build/style'));
}

const setupPayload = async () => {
    payload = JSON.parse(fs.readFileSync('src/data.json'));
    const pkgs = Object.keys(payload.packages);
    const colors = await parseColors({pkgs});
    payload.colors = colors;
};

const manageEnvironment = (env) => {
    env.addFilter('timestamp', function(arr) {
        return new Date(...arr).getTime();
    });
    env.addFilter('date', function(arr) {
        const iso = new Date(...arr).toISOString();
        return iso.substring(0, iso.indexOf('T'));
    });
};

gulp.task('html', function() { 
    return gulp.src(['src/views/*.njk', '!src/views/single-page.njk'])
        .pipe(data(payload))
        .pipe(nunjucksRender({
            path: ['src/views'],
            manageEnv: manageEnvironment
        }))
        .pipe(gulp.dest('build'));
});

function parsePackagePage(key, i, pkgs) {
    const length = pkgs.length;
    const first = i == 0;
    const last = i >= (length - 1);

    const related = [];
    related.push(first ? pkgs[i + 2] : pkgs[i - 1]);
    related.push(last ? pkgs[i - 2] : pkgs[i + 1]);

    const pl = { current: key, ...payload, related };

    return gulp.src('src/views/single-page.njk')
        .pipe(data(pl))
        .pipe(nunjucksRender({
            path: ['src/views'],
            manageEnv: manageEnvironment
        }))
        .pipe(rename({basename: key}))
        .pipe(gulp.dest('build/packages'));
}

function packagesHtml() {
    return mergeStream(Object.keys(payload.packages).map(parsePackagePage));
}

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
        },
        snippetOptions: {
            rule: {
                match: /<\/head>/i,
                fn: (snippet, match) => snippet + match
            }
        }
    });
});

gulp.task('watch', function() {
    /* Watch scss, run the sass task on change. */
    gulp.watch(['src/scss/*.scss', '!src/scss/vendor.scss', 'src/scss/**/*.scss'], gulp.series(styles, 'bs-reload'));
    /* Watch app.js file, run the vendor-js task on change. */
    gulp.watch(['src/js/main.js'], gulp.series('js', 'bs-reload'));
    /* Watch .html files, run the bs-reload task on change. */
    gulp.watch(['src/views/*.njk', 'src/views/**/*.njk'], gulp.series('html', packagesHtml, 'bs-reload'));
});

function clean() {
    return del('build');
}

/* Watch scss, js and html files, doing different things with each. */
gulp.task('default', gulp.series(
    clean,
    setupPayload,
    gulp.parallel('html', packagesHtml, vendorStyles, styles, vendorJs, 'js'), 
    gulp.parallel('browser-sync', 'watch')
));