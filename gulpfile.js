const fs = require('fs');
const del = require('del');
const browserSync = require('browser-sync');
const mergeStream = require('merge-stream');

const gulp = require('gulp');
const sass = require('gulp-sass');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const postcss = require('gulp-postcss');
const eslint = require('gulp-eslint');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const gulpif = require('gulp-if');
const stylelint = require('gulp-stylelint');

const imageminWebp = require('imagemin-webp');
const parseColors = require('./src/js/build/parseColors');

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
  'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css',
];

const PROD = process.env.NODE_ENV === 'production';

let payload = {};

function vendorScripts() {
  return gulp.src(LIBS_VENDOR)
    .pipe(concat('vendor.js'))
    .pipe(gulpif(PROD, terser()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('.tmp/scripts'));
}


function coreScripts() {
  return gulp.src(['src/js/main.js'])
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(gulpif(PROD, eslint.failAfterError()))
    .pipe(gulpif(PROD, terser()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('.tmp/scripts'));
}

/* Sass task */
function coreStyles() {
  return gulp.src('src/scss/main.scss')
    .pipe(stylelint({
      failAfterError: PROD,
      fix: true,
      reporters: [
        { formatter: 'verbose', console: true },
      ],
    }))
    .pipe(sass({
      errLogToConsole: true,
      outputStyle: 'expanded',
      precision: 10,
    }))
    .pipe(postcss()) // TODO: Exclude Lint on prod
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('.tmp/style'));
}

function vendorStyles() {
  const $base = gulp.src('src/scss/vendor.scss')
    .pipe(sass({
      errLogToConsole: true,
      precision: 10,
    }));

  return mergeStream(gulp.src(CSS_VENDOR), $base)
    .pipe(concat('vendor.min.css'))
    .pipe(gulp.dest('.tmp/style'));
}

async function setupPayload() {
  payload = JSON.parse(fs.readFileSync('src/data.json'));
  const pkgs = Object.keys(payload.packages);

  // Parse package colors
  const colors = await parseColors({ pkgs });
  payload.colors = colors;
}

const getManageEnv = (env) => {
  env.addFilter('timestamp', (arr) => new Date(...arr).getTime());

  // Date filter
  env.addFilter('date', (arr) => {
    const iso = new Date(...arr).toISOString();
    return iso.substring(0, iso.indexOf('T'));
  });
};

function staticTemplates() {
  return gulp.src(['src/views/*.njk', '!src/views/single-page.njk'])
    .pipe(data(payload))
    .pipe(nunjucksRender({
      path: ['src/views'],
      manageEnv: getManageEnv,
    }))
    .pipe(gulpif(PROD, htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest('.tmp'));
}

function parsePackage(key, i, pkgs) {
  const { length } = pkgs;
  const first = i === 0;
  const last = i >= (length - 1);

  const related = [];
  related.push(first ? pkgs[i + 2] : pkgs[i - 1]);
  related.push(last ? pkgs[i - 2] : pkgs[i + 1]);

  const pl = { current: key, ...payload, related };

  return gulp.src('src/views/single-page.njk')
    .pipe(data(pl))
    .pipe(nunjucksRender({
      path: ['src/views'],
      manageEnv: getManageEnv,
    }))
    .pipe(gulpif(PROD, htmlmin({ collapseWhitespace: true })))
    .pipe(rename({ basename: key }))
    .pipe(gulp.dest('.tmp/packages'));
}

function packagesTemplate() {
  const $pages = Object.keys(payload.packages).map(parsePackage);
  return mergeStream($pages);
}

/* Reload task */
function bsReload() {
  browserSync.reload();
}

function bsInit() {
  browserSync.init({
    server: {
      baseDir: ['.tmp', 'src'],
    },
    snippetOptions: { // TurboLinks Support
      rule: {
        match: /<\/head>/i,
        fn: (snippet, match) => snippet + match,
      },
    },
  });
}

function clean() {
  return del(['build', '.tmp']);
}

function cleanTmp() {
  return del('.tmp');
}

function watch() {
  gulp.watch(['src/scss/*.scss', '!src/scss/vendor.scss', 'src/scss/**/*.scss'],
    gulp.series(coreStyles, bsReload));

  // Vendor styles
  gulp.watch(['src/scss/vendor.scss'],
    gulp.series(vendorStyles, bsReload));

  // Core scripts
  gulp.watch(['src/js/main.js'], gulp.series(coreScripts, bsReload));

  // Templates
  gulp.watch(['src/views/*.njk', 'src/views/**/*.njk'],
    gulp.series(gulp.parallel(staticTemplates, packagesTemplate), bsReload));
}

function optimizeBuildImages() {
  return gulp.src('src/img/**/*')
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imageminWebp({ quality: 75 }),
    ]))
    .pipe(gulp.dest('build/img'));
}

function copyBuildAssets() {
  const build = gulp.src('.tmp/**/*')
    .pipe(gulp.dest('build'));

  const assets = gulp.src([
    'src/site.webmanifest',
    'src/browserconfig.xml',
    'src/fonts/**/*',
    'src/lang/**/*',
  ], { base: './src' })
    .pipe(gulp.dest('build'));

  return mergeStream(build, assets);
}

const core = gulp.series(
  clean,
  setupPayload,
  gulp.parallel(
    staticTemplates,
    packagesTemplate,
    vendorStyles,
    coreStyles,
    vendorScripts,
    coreScripts,
  ),
);

const dev = gulp.series(
  core,
  gulp.parallel(bsInit, watch),
);

const build = gulp.series(
  core,
  gulp.parallel(
    optimizeBuildImages,
    copyBuildAssets,
  ),
  cleanTmp,
);

gulp.task('dev', dev);
gulp.task('build', build);
