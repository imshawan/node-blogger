import dotenv from 'dotenv';
import { Logger } from '@src/utilities';
import {sync} from 'glob';

const logger = new Logger();

interface TestFile {
    execute: Function | Promise<any>
}

// **** Setup **** //

// ** Init ** //

// NOTE: MUST BE FIRST!! Load env vars
const result2 = dotenv.config({
  path: './env/test.env',
});
if (result2.error) {
  throw result2.error;
}

const testFiles = sync('./spec/**/*.spec.ts'); 

// Run all or a single unit-test

async function execTests() {
    let failed = 0, passed = 0, overallStatus = 'failed';
    if (testFiles.length) {
        await Promise.all(testFiles.map(async file => {
            const testFile: TestFile = require(file);
            if (Object.hasOwnProperty.bind(testFile)('execute') && typeof testFile.execute == 'function') {
                try {
                  if (testFile.execute.constructor.name == 'AsyncFunction') {
                      await testFile.execute();
                  } else {
                      testFile.execute();
                  }
                  passed++;
                } catch (err) {
                  failed++;
              }
            }
        }));
    }

    if (!Boolean(failed)) {
        overallStatus = 'passed';
    }

    return {passed, failed, overallStatus};
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
