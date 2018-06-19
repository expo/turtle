'use strict';

const childProcess = require('child_process');
const util = require('util');
const path = require('path');

const gulp = require('gulp');
const babel = require('gulp-babel');
const changed = require('gulp-changed');
const nodemon = require('gulp-nodemon');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const rimraf = require('rimraf');

const rimrafAsync = util.promisify(rimraf);

const tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', async () => {
  console.log(`Removing build directories...`);
  await rimrafAsync('build');
});

gulp.task('build:server', () => {
  console.log(`Compiling the Node.js server JavaScript...`);
  return tsProject
    .src()
    .pipe(plumber())
    .pipe(changed('build'))
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(babel())
    .pipe(
      sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: '../src',
      })
    )
    .pipe(gulp.dest('build'));
});

gulp.task('watch:source', async () => {
  console.log(`Watching for changes to the Node.js server JavaScript...`);
  gulp.watch('src/**/*.(t|j)s', gulp.series('build:server'));
});

gulp.task('watch:local', createWatchTask('development'));
gulp.task('watch:server', createWatchTask('production'));

function createWatchTask(nodeEnv) {
  return async () => {
    console.log(`Starting the Node.js server and watching for changes (NODE_ENV=${nodeEnv})...`);
    // Run nodemon in a separate process to isolate its side effects on stdio streams
    let nodeCmd = 'node';
    if (nodeEnv === 'development') {
      nodeCmd += ' --inspect=:9315';
    }
    nodemon({
      script: './build/server.js',
      execMap: {
        js: nodeCmd,
      },
      env: {
        NODE_ENV: nodeEnv,
      },

      watch: ['./build'],
      stdout: false,
      readable: false,
    }).on('readable', function() {
      const bunyan = childProcess.fork(
        path.join('.', 'node_modules', '.bin', 'bunyan'),
        ['-o', 'short', '-l', 'debug', '--color'],
        { silent: true }
      );

      bunyan.stdout.pipe(process.stdout);
      bunyan.stderr.pipe(process.stderr);
      this.stdout.pipe(bunyan.stdin);
      this.stderr.pipe(bunyan.stdin);
    });
  };
}

gulp.task(
  'watch',
  gulp.series('clean', 'build:server', gulp.parallel('watch:source', 'watch:local'))
);

gulp.task('default', gulp.series('watch'));
