import nconf from 'nconf';
import { Logger } from '@src/utilities';
import {sync} from 'glob';
import childProcess from 'child_process';

const logger = new Logger();

interface TestFile {
    execute: Function | Promise<any>
}

// **** Setup **** //

// ** Init ** //

// NOTE: MUST BE FIRST!! Load env vars
nconf.argv().env().file({ file: 'config.json' });

const testFiles = sync('./spec/**/*.spec.ts'); 

// Run all or a single unit-test

async function execTests() {
    let failed = 0, passed = 0, overallStatus = 'failed';
    if (testFiles.length) {
        await Promise.all(testFiles.map(async file => {
            await exec(`mocha --require ts-node/register -r tsconfig-paths/register ${file}`, './');
        }));
    }

    if (!Boolean(failed)) {
        overallStatus = 'passed';
    }

    return {passed, failed, overallStatus};
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
