/*
 * Copyright (C) 2023 Shawan Mandal <github@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import nconf from 'nconf';
import { Logger } from '@src/utilities';
import {sync} from 'glob';
import childProcess from 'child_process';
import path from 'path';
import server from '@src/server';
import Mocha, { Test } from 'mocha';
import { ITestConfig, ITestResult } from '@src/types';
import '../src/helpers/logstream';

const DEFAULT_MOCHA_TIMEOUT = 1000 * 10; // 10 seconds
const FILE_FLAG = '--file=';

// **** Setup **** //

// ** Init ** //

// NOTE: MUST BE FIRST!! Load env vars
nconf.argv().env().file({ file: 'config.json' });

const testFiles = [...new Set([...sync('./spec/**/*.spec.ts'), ...sync('./spec/*.spec.ts')])]; 
const testConfig: ITestConfig = nconf.get('test');
const mochaOptions = {timeout: Number(testConfig.timeout) || DEFAULT_MOCHA_TIMEOUT};

const logger = new Logger();
const mocha = new Mocha(mochaOptions);

// Run all or a single unit-test

async function execTests(filesArray: Array<string>): Promise<ITestResult> {
    await server.initialize();

    return new Promise((resolve, reject) => {
        let total = 0,
          failed = 0,
          passed = 0,
          overallStatus = "failed";

        if (filesArray.length) {
            filesArray.forEach(async file => mocha.addFile(file));

            mocha.run()
              .on('test', function(test: Test) {
                  total++;
              })
              .on('pass', function(test: Test) {
                  passed++;
              })
              .on('fail', function(test: Test, err) {
                  failed++;
              })
              .on('end', function() {
                  if (!Boolean(failed)) {
                      overallStatus = 'passed';
                  }

                  resolve({passed, failed, overallStatus, total});
              });
        }
    });
}

function isTestFileSpecified() {
    return Boolean(process.argv.find(arg => arg.includes(FILE_FLAG)));
}

function getFileSpecified() {
    const args = process.argv.find(arg => arg.includes(FILE_FLAG));
    let fileName = '';

    if (args) {
        let [key, value] = args.split('=');
        if (value.length) {
            value = value.trim().replace(/\.((spec)?\.ts)/g, '');
            fileName = [value, 'spec.ts'].join('.');
        }

        if (fileName.length) {
            let filefound = testFiles.find(e => e.includes(fileName));
            if (filefound) {
                fileName = filefound;
            }
        }
    }

    return fileName;
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

// Wait for tests to finish
(async () => {
  let filesArray = testFiles;
  if (isTestFileSpecified()) {
      filesArray = [getFileSpecified()];
  }

  const info = await execTests(filesArray);
  if (info.overallStatus === 'passed') {
      logger.info('All tests have passed :)');
  } else {
      logger.error('At least one test has failed :(');
  }
})();
