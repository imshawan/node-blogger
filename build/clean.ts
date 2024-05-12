/**
 * @date 10-09-2023
 * @author imshawan <github@imshawan.dev>
 * @description Clean Build Directory Script With Command Line Interface
 *
 * This script is designed to maintain a clean and organized project structure by
 * removing the './dist' directory via command line. This operation is often necessary 
 * in software development and maintenance processes, particularly when dealing with 
 * build or distribution files (commonly found in a 'dist' folder).
 * 
 * This provides the developers streamlining the workflow and reducing the risk of errors.
*/

import fs from 'fs-extra';
import path from 'path'
import yargs, { ArgumentsCamelCase } from 'yargs';
import pkg from '../package.json';

yargs
    .scriptName(path.basename(__filename))
    .usage(`\n$0 <cmd> [options]`)
    .command({
        command: 'clean',
        describe: 'Clears up the existing dist files',
        builder: {
            path: {
                alias: 'p',
                describe: 'Path to the folder to process',
                demandOption: true, // Makes this argument mandatory
                type: 'string', // Specifies the data type of the argument
            },
        },
        handler: function handler(argv: ArgumentsCamelCase<any>): Promise<any> {
            const folderPath = argv.path;
            return new Promise((resolve, reject) => {
                if (!fs.existsSync(folderPath)) {
                    return reject('No such directory found');
                }
                return fs.remove(folderPath, (err) => {
                    if (err) {
                        return reject(err)
                    } else {
                        console.log(`Cleared ${folderPath}`)
                        return resolve('');
                    }
                });
            });
        },
    })
    .version(pkg.version)
    .help(); // Adds a '--help' option to display usage information

// Parse the command-line arguments
yargs.parse();
