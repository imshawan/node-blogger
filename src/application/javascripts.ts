import fs from 'fs';
import path from 'path';
import {paths} from '@src/constants';

const {assetsDir} = paths;

const baseScripts = [
    "/scripts/require.js",
    "/scripts/require.config.js",
    "/scripts/modules/jquery-addons.js",
    "/scripts/modules/main.js",
    "/scripts/modules/utilities.js",
];

const adminScripts = [
    "/scripts/modules/admin.js",
];

const vendors = path.join(paths.javaScriptsDir, 'vendors');
var vendorScripts: Array<string> = [];

if (fs.existsSync(vendors)) {
    vendorScripts = fs.readdirSync(vendors).map(e => ['/scripts/vendors/', e].join(''));
}


export {
    vendorScripts, assetsDir, baseScripts, adminScripts
  }
