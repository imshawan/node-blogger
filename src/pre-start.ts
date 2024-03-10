/**
 * Pre-start is where we want to place things that must run BEFORE the express 
 * server is started. This is useful for environment variables, command-line 
 * arguments, and cron-jobs.
 */

// NOTE: DO NOT IMPORT ANY SOURCE CODE HERE
import path from 'path';
import dotenv from 'dotenv';
import { parse } from 'ts-command-line-args';
import fs from 'fs';
import { validateConfiguration } from './helpers';
import { Logger } from './utilities';
import * as logService from './helpers/logstream';
import * as Utilities from './utilities';


/**
 * @date 10-03-2024
 * @description The logger service should run before any service so that the logs emitted by console logger can be written to file.
 */
logService.initialize();


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

// **** Types **** //

interface IArgs {
    env: string;
}


// **** Setup **** //

// Command line arguments
const args = parse<IArgs>({
    env: {
        type: String,
        defaultValue: 'development',
        alias: 'e',
    },
});

// Set the env file
const result2 = dotenv.config({
    path: path.join(__dirname, `../env/${args.env}.env`),
});
if (result2.error) {
    throw result2.error;
}
