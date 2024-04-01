/**
 * Remove old files, copy front-end ones.
 */

import fs from 'fs-extra';
import childProcess from 'child_process';
import {Logger} from '../src/utilities/logger';
import {minifyJavaScripts} from './minify';
import { capitalizeFirstLetter } from '@src/utilities';
import '../src/helpers/logstream';

const logger = new Logger({prefix: 'build'});
const requiredConfigFields = { host: String, mongodb: Object, secret: String, env: String };

type KeysOfRequiredConfigFields = keyof typeof requiredConfigFields;

/**
 * Start
 */
module.exports = async function build () {
  try {
      let time = Date.now();

      if (!fs.existsSync('config.json')) {
          return logger.error('Could not find config file. Please re-setup the application.');
      }

      const configFileData = fs.readFileSync('config.json', {encoding: 'utf-8'});
      const configuration = JSON.parse(configFileData);
      const keysOfRequiredFields: KeysOfRequiredConfigFields[] = Object.keys(requiredConfigFields) as KeysOfRequiredConfigFields[];

      let errors = 0;
      
      keysOfRequiredFields.forEach((key: KeysOfRequiredConfigFields) => {
          if (!Object.hasOwnProperty.bind(configuration)(key)) {
              logger.error(generateMissingFieldErrorMsg(key));
              errors++;
          }

          if (configuration[key] && typeof configuration[key] != requiredConfigFields[key].name.toLowerCase()) {
              logger.error(key, 'must be of type', requiredConfigFields[key].name, 'but found', capitalizeFirstLetter(typeof configuration[key]));
              errors++;
          }
      });

      if (errors) {
          return logger.info('Found', errors, 'problem(s) with the configuration file. Have you setup the project properly?');
      }
      
      logger.info('Removing current build');
      await remove('./dist');

      logger.info('Building client-side static and JavaScript files');
      await buildClientSideFiles();
      
      await copy('./src/views', 'dist/views');
      
      logger.info('Building server-side files');
      await exec('tsc --build tsconfig.prod.json', './');

      await copy('./dist/src', './dist/');
      await remove('./dist/src');

      let timeDiff = parseFloat(String((Date.now() - time) / 1000)).toFixed(2);

      logger.success(`Build process completed in ${timeDiff}s`);
    
  } catch (err) {
      logger.error(err);
  }
}

async function buildClientSideFiles(): Promise<void> {
    const outputDir = './dist/public/';
    await copy('./public/css', outputDir + 'css');
    await copy('./public/images', outputDir + 'images');

    await minifyJavaScripts();
}

function generateMissingFieldErrorMsg(field: string) {
    return 'Required property ' + field + ' missing from the config file.';
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
