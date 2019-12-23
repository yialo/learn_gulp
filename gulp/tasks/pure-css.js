const { src, dest, lastRun, series, watch } = require('gulp');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const gulpIf = require('gulp-if');
const isChanged = require('gulp-changed');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const isProduction = require('../utils/is-production');

const SRC_PATH = `./src/css/*.css`;
const DEST_PATH = `./public/assets/css`;

const processCssFiles = () => (
  src(SRC_PATH)
    .pipe(gulpIf(!isProduction, sourcemaps.init()))
    .pipe(debug({ title: 'CSS:PostProcessing' }))
    .pipe(postcss([autoprefixer]))
    .pipe(debug({ title: 'CSS:Concat' }))
    .pipe(concat('all.css'))
    .pipe(gulpIf(
        isProduction,
        postcss([cssnano]),
        sourcemaps.write('./')
    ))
    .pipe(gulpIf(isProduction, rename('all.min.css')))
    .pipe(debug({ title: 'CSS:IsChanged?' }))
    .pipe(isChanged(DEST_PATH, { hasChanged: isChanged.compareContents }))
    .pipe(debug({ title: 'CSS:Dest' }))
    .pipe(dest(DEST_PATH))
);

processCssFiles.displayName = 'pure css: process files';

const taskList = [processCssFiles];

if (!isProduction) {
  const appendWatcher = (done) => {
    watch(SRC_PATH, series(processCssFiles));
    done();
  };

  appendWatcher.displayName = 'pure css: append watcher';

  taskList.push(appendWatcher);
}

module.exports = series(...taskList);
