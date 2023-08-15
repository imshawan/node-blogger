/**
 * Remove old files, copy front-end ones.
 */

import fs from 'fs-extra';
import childProcess from 'child_process';
import {Logger} from '../src/utilities/logger';
import {minifyJavaScripts} from './minify';

const logger = new Logger({prefix: 'build'});

/**
 * Start
 */
module.exports = async function build () {
  try {
    var time = Date.now();
    
    logger.info('Removing current build');
    await remove('./dist');

    logger.info('Building client-side static and JavaScript files');
    await buildClientSideFiles();
    
    await copy('./src/views', 'dist/views');
    
    logger.info('Building server-side files');
    await exec('tsc --build tsconfig.prod.json', './');

    await copy('./dist/src', './dist/');
    await remove('./dist/src');

    var timeDiff = parseFloat(String((Date.now() - time) / 1000)).toFixed(2);

    logger.success(`Build process completed in ${timeDiff}s`);
    
  } catch (err) {
    logger.error(err);
  }
}

async function buildClientSideFiles(): Promise<void> {
    const outputDir = './dist/public/';
    await copy('./public/css', outputDir + 'css');
    await copy('./public/img', outputDir + 'img');

    await minifyJavaScripts();
}

/**
 * Remove file
 */
function remove(loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.remove(loc, (err) => {
      return (!!err ? rej(err) : res());
    });
  });
}

/**
 * Copy file.
 */
function copy(src: string, dest: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.copy(src, dest, (err) => {
      return (!!err ? rej(err) : res());
    });
  });
}

/**
 * Do command line command.
 */
function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return childProcess.exec(cmd, {cwd: loc}, (err, stdout, stderr) => {
      if (!!stdout) {
        logger.info(stdout);
      }
      if (!!stderr) {
        logger.warn(stderr);
      }
      return (!!err ? rej(err) : res());
    });
  });
}
