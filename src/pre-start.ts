/**
 * Pre-start is where we want to place things that must run BEFORE the express 
 * server is started. This is useful for environment variables, command-line 
 * arguments, and cron-jobs.
 */

// NOTE: DO NOT IMPORT ANY SOURCE CODE HERE
import path from 'path';
import { parse } from 'ts-command-line-args';
import fs from 'fs';
import { validateConfiguration } from './helpers';
import { Logger } from './utilities';
import * as Utilities from './utilities';
import './helpers/logstream';

const logger = new Logger({prefix: Utilities.resolveFilename(__filename)});

/**
 * @date 27-10-2023
 * @description Validate whether the project was setup properly. If config file exists or not.
 */
if (!fs.existsSync('config.json')) {
    logger.error("Missing configuration files. Run 'npm run setup' for setting up the project.");
    process.exit(0);

} else {
    const configFileData = fs.readFileSync('config.json', {encoding: 'utf-8'});
    const configuration = JSON.parse(configFileData);
    validateConfiguration(configuration);
}
