export * from './StatusCodesWithError';
export * from './StatusCodesWithMessage';
export * from './ImageExts';
export * from './Collections';
export * from './sorting';
export * from './content';

import path from "path";
import nconf from "nconf";
import {NodeEnvs} from '@src/constants/misc';
import { ValueOf, MutableObject } from '@src/types';
import pkg from '../../package.json';

const basePaths = {
    development: path.join(__dirname, '../../'),
    production: path.join(__dirname, '../../dist')
}
const envVar = getNodeEnv();
const env: ValueOf<NodeEnvs> = (envVar || 'development');
const baseDir = env === 'production' ? basePaths.production : basePaths.development;

export const paths = {
    baseDir: baseDir,
    uploadsDir: path.join(baseDir, 'public', 'uploads'),
    uploadsDirString: ['uploads'].join('/'),
    buildDir: path.join(baseDir, 'dist'),
    templatesDir: path.join(baseDir, 'src', 'views'),
    templatePartialsDir: path.join(baseDir, 'src', 'views', 'partials'),
    adminTemplatesDir: path.join(baseDir, 'src', 'views', 'admin'),
    adminTemplatePartialsDir: path.join(baseDir, 'src', 'views', 'admin', 'partials'),
    assetsDir: path.join(baseDir, 'public'),
    javaScriptsDir: path.join(baseDir, 'public', 'scripts'),
};

export const siteName = 'Node Blogger';

export const version = pkg.version;

/**
 * 
 * @date 09-10-2023
 * @author imshawan <hello@imshawan.dev>
 * @function getNodeEnv
 * @description Checks the command-line arguments passed to the Node.js process to find an environment variable specified.
 * Alternatively, checks the application configuration using nconf to see if an environment value is set there. 
 * 
 * If neither found, the function defaults to returning 'development' as the environment.
 */
function getNodeEnv (): string {
    const key = 'env';
    const args = process.argv;
    const parsedArgs: MutableObject = {};

    if (nconf.get(key)) {
        return nconf.get(key);
    }
    
    for (let i = 2; i < args.length; i++) { 
        const arg = args[i];

        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            parsedArgs[key] = value || true;
        }
    }

    const value = parsedArgs[key];
    if (value) return String(value).toLowerCase().trim();
    else return 'development';
}