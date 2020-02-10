const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');
const banner = require('gulp-banner');
const pkg = require('./package.json');

const bannerComment = `/**
 * @license ${pkg.name} v${pkg.version}
 *
 * Copyright (c) Chowa Techonlogies Co.,Ltd.(http://www.chowa.cn).
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
`;

gulp.task('clean es', () => {
    if (!fs.existsSync(path.join(__dirname, 'es'))) {
        return Promise.resolve();
    }

    return gulp.src(path.join(__dirname, 'es'), { read: false })
        .pipe(clean({ force: true }));
});

gulp.task('compile typescript', () => {
    const tsProject = ts.createProject('tsconfig.json', { declaration: true });
    return gulp.src(path.join(__dirname, 'src/*.ts'))
        .pipe(tsProject())
        .pipe(banner(bannerComment))
        .pipe(gulp.dest(path.join(__dirname, 'es')));
});

gulp.task('default', gulp.series(
    'clean es',
    'compile typescript'
));
