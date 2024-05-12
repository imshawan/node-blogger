#!/usr/bin/env node

/**
 * @date 28-09-2023
 * @author imshawan <github@imshawan.dev>
 * 
 * @description Changelog generator Script
 * This Node.js process script uses the Changelog class from the 'utilities' module to generate and write a changelog file.
 * This changelog file is typically used to document changes, additions, and updates in the project.
 */

import { execSync } from 'child_process';
import { Changelog } from '../src/utilities/changelog';
import moment from 'moment';
import pkg from '../package.json';

const containsModifiedFiles = getModifiedFilesCount();

if (containsModifiedFiles) {
    console.log(`The repository has ${containsModifiedFiles} modified file(s). Please commit the existing files and than proceed.`);
    process.exit(0);
    
} else {
    new Changelog().write();

    execSync('git add CHANGELOG.md');
    execSync(`git commit -m "[${moment().format('DD-MM-YYYY')}] Changelog CI - Latest Changelogs for ${pkg.name} v${pkg.version}"`);
}

function getModifiedFilesCount(): number {
    const gitStatusOutput: string = execSync('git status --porcelain').toString('utf-8').trim();
    return gitStatusOutput.split('\n').length;
}