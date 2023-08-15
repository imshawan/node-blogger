#!/usr/bin/env node

/**
 * @date 15-08-2023
 * @author imshawan <hello@imshawan.dev>
 * 
 * @description Production Build Script
 * This Node.js process is invoked automatically when the command `npm run build` is executed. 
 * It orchestrates the production build process and minification of files for the application, encompassing client, server, and stylesheet files.
 */

'use strict';

require('./build')();