import http from 'http';
import path from 'path';
import fs from 'fs';
import express, {Request, Response, NextFunction, Application} from 'express';
import uglify from 'uglify-js';
import ejs from 'ejs';

import {Logger} from '../src/utilities';
import {RouteError} from '../src/helpers';
import EnvVars from '../src/constants/EnvVars';
import HttpStatusCodes from '../src/constants/HttpStatusCodes';
import {NodeEnvs} from '../src/constants/misc';
import apiHandler from './api';
import { MutableObject } from '../src/types';
import defults from './data/defaults.json'


const logger = new Logger({prefix: 'setup'});
const app = express();
const httpServer = http.createServer(app);
const partialsDir = path.join(__dirname, 'views', 'partials');

const start = async function (port: Number, callback: Function) {

    await buildAssets();
    await setupExpressServer(app);

    app.get('/', setup);
    app.use('/setup/api', apiHandler);

    app.use('/*', function (req, res) {
        const notFoundTemplate = path.join(__dirname, '../src', 'views', '404.ejs');
        const headerTemplate = path.join(partialsDir, 'header.ejs');
        const footerTemplate = path.join(partialsDir, 'footer.ejs');
        const options = {
            title: 'Not found'
        };

        const template = fs.readFileSync(notFoundTemplate).toString()
        const header = ejs.render(fs.readFileSync(headerTemplate).toString(), options);
        const footer = fs.readFileSync(footerTemplate).toString();

        const html = [header, template, footer].join('');

        res.status(404).send(html);
    });
    
    // Add error handler
    app.use((err: Error, _: Request, res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: NextFunction,
    ) => {
        if (EnvVars.NodeEnv !== NodeEnvs.Test) {
            logger.error(err, true);
        }
        let status = HttpStatusCodes.BAD_REQUEST;
        if (err instanceof RouteError) {
            status = err.status;
        }

        return res.status(status).json({
            error: err.message,
        });
    });

    app.set('port', port || 3000);
    app.listen(port, () => {
        if (callback && typeof callback == 'function') {
            callback(httpServer);
        }
    });
}

const destroy = (callback?: Function) => {
    httpServer.close(() => {
        if (callback && typeof callback == 'function') {
            callback();
        }
    });
}

async function setupExpressServer(app: Application) {
    app.use('/assets', express.static(path.join(__dirname, 'assets')));

    // Serving the common CSS for the app
    app.use('/assets/common.css', express.static(path.join(__dirname, '../public/css/common.css')));

    // Serving images
    app.use('/images', express.static(path.join(__dirname, '../public/images')))
    
    // View engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.set('trust proxy', 1);

    app.use(express.json({
        limit: '1mb',
    }));
    app.use(express.urlencoded({
        extended: true,
        limit: '1mb'
    }));
}

async function buildAssets() {
    const assetsDir = path.join(__dirname, 'assets');
    const outputScriptFile = path.join(assetsDir, 'setup.min.js');
    const cssFilesDir  = path.join(__dirname, 'public', 'css');
    const scriptsDir  = path.join(__dirname, 'public', 'scripts');
    const cssFiles = fs.readdirSync(cssFilesDir);
    const scripts = fs.readdirSync(scriptsDir);
    const modulesToMinify = [
        'jquery-addons.js',
        'utilities.js',
    ];
    const uglifyOptions = {
        compress: {assignments: true},
        mangle: {toplevel: true},
        output: {
          beautify: false,
        },
      };
    var minified = '';

    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir);
    }

    let previousFiles = fs.readdirSync(assetsDir);
    if (previousFiles) {
        previousFiles.forEach(file => fs.unlinkSync(path.join(assetsDir,  file)));
    }

    logger.info('Building assets');
    if (cssFiles.length) {
        cssFiles.forEach(fileName => fs.copyFileSync(path.join(cssFilesDir, fileName), path.join(assetsDir, fileName)));
    }
    if (scripts.length) {
        let scriptsContent = scripts.map(function (file) {
            return fs.readFileSync(path.join(__dirname, 'public', 'scripts', file), 'utf8');
        });
        let modulesContent = modulesToMinify.map(function (file) {
            return fs.readFileSync(path.join(__dirname, '../public', 'scripts', 'modules', file), 'utf8');
        });

        let result = uglify.minify([...scriptsContent, ...modulesContent], uglifyOptions);
        if (result.error) {
            logger.error("Error minifying: " + result.error);
        }
        minified = result.code;
    }

    fs.writeFileSync(outputScriptFile, minified, {encoding: 'utf-8'});
}

async function setup(req: Request, res: Response) {
    const data: MutableObject = {};

    data.title = 'Setup | ' + defults.siteName;
    data.siteName = defults.siteName;
    data.logo = defults.logo;

    res.render('install', data);
}

export default {
    start, destroy, app
}