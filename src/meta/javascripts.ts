import fs from 'fs';
import path from 'path';
import {paths} from '../../constants';

const {assetsDir} = paths;

const baseScripts = [
    "/scripts/require.js",
    "/scripts/require.config.js",
    "/scripts/modules/main.js",
];

const vendors = path.join(paths.javaScriptsDir, 'vendors');
let vendorScripts: Array<string> = [];

if (fs.existsSync(vendors)) {
    vendorScripts = fs.readdirSync(vendors).map(e => ['/scripts/vendors/', e].join(''));
}


export {
    vendorScripts, assetsDir, baseScripts
  }
