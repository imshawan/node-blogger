import nconf from 'nconf';
import { Logger } from '@src/utilities';
import {sync} from 'glob';
import childProcess from 'child_process';
import path from 'path';
import server from '@src/server';
import Mocha, { Test } from 'mocha';
import { ITestConfig, ITestResult } from '@src/types';

const DEFAULT_MOCHA_TIMEOUT = 1000 * 10; // 10 seconds

// **** Setup **** //

// ** Init ** //

// NOTE: MUST BE FIRST!! Load env vars
nconf.argv().env().file({ file: 'config.json' });

const testFiles = sync('./spec/**/*.spec.ts'); 
const testConfig: ITestConfig = nconf.get('test');
const mochaOptions = {timeout: Number(testConfig.timeout) || DEFAULT_MOCHA_TIMEOUT};

const logger = new Logger();
const mocha = new Mocha(mochaOptions);

// Run all or a single unit-test

async function execTests(): Promise<ITestResult> {
    await server.initialize();

    return new Promise((resolve, reject) => {
        let total = 0,
          failed = 0,
          passed = 0,
          overallStatus = "failed";

        if (testFiles.length) {
            testFiles.forEach(async file => mocha.addFile(file));

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
  const info = await execTests();
  if (info.overallStatus === 'passed') {
      logger.info('All tests have passed :)');
  } else {
      logger.error('At least one test has failed :(');
  }
})();
