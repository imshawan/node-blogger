#!/usr/bin/env node

/**
 * @date 28-09-2023
 * @author imshawan <hello@imshawan.dev>
 * 
 * @description Changelog generator Script
 * This Node.js process script uses the Changelog class from the 'utilities' module to generate and write a changelog file.
 * This changelog file is typically used to document changes, additions, and updates in the project.
 */

import { Changelog } from '../src/utilities/changelog';

new Changelog().write();