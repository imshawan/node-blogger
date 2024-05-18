/**
 * Setup express server.
 */

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, {Request, Response, NextFunction, Application} from 'express';
import http from 'http';
import useragent from 'express-useragent';
import expressSession from 'express-session';
import chalk from 'chalk';
import ReadLine from 'readline';
import i18nextMiddleware from 'i18next-http-middleware';

import 'express-async-errors';

import baseRouter from '@src/routes';
import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import {NodeEnvs} from '@src/constants/misc';
import { ANSI } from './constants/Ansi';
import {RouteError} from '@src/helpers';
import { handleApiResponse, validateConfiguration, extractRemoteAddrFromRequest } from '@src/helpers';
import { overrideRender, user, authentication, overrideHeaders, addUserSessionAgent } from '@src/middlewares';
import {initializeDbConnection, mongo, database} from './database';
import { cookies, application, initialize as initializeApplicationStore } from './application';
import config from '../config.json';
import _ from 'lodash';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import flash from 'express-flash';
import nconf from 'nconf';
import { Logger, getISOTimestamp, isPortAvailable } from './utilities';
import {paths} from './constants';
import Locales from '@src/locales';
import { initializeEmailClient } from './email/emailer';
import { TFunction } from 'i18next';

const logger = new Logger();
const app = express();
const httpServer = http.createServer(app);

const start = async function (port: Number, callback: Function) {
    var address = nconf.get('host');

    if (address.split(':').length > 2) {
        address = address.split(':');
        address.pop();

        address = address.join(':');
    }

    await initialize();

    app.set('port', port);
    app.set('address', address);
    app.listen(port, () => {
        if (callback && typeof callback == 'function') {
            callback(httpServer);
        }
    }).on('error', function(err){
        if (String(err.message).includes('EADDRINUSE')) {
            
            const readlineInterface = ReadLine.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            logger.warn('Port ' + port + ' is already in use.');

            readlineInterface.question(`${ANSI.BOLD}Do you want to choose a different port? (yes/no) ${ANSI.RESET}`, async (answer) => {
                if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                    let isAvailable = false;

                    while (!isAvailable) {
                        port = Number(port) + 1;
                        isAvailable = await isPortAvailable(Number(port));
                    }

                    start(port, callback);
                } else {
                    console.log('Exiting...');
                    process.exit(0);
                }

                readlineInterface.close();
            });
        }
    });
}

const initialize = async function () {
    logger.info('Validating configuration file');
    validateConfiguration(config)

    let mongoConfig = config.mongodb;
    if (nconf.get('env') == 'test') {
        mongoConfig = config.test.mongodb;
    }

    await initializeDbConnection(mongoConfig);
    await initializeApplicationStore();
    await initializeEmailClient();
    await setupExpressServer(app);
    
    enableAppLocalization(app);

    // Production morgan logging pattern
    morgan.token(NodeEnvs.Production, () => {
        return `:timestamp ${chalk.magentaBright(":remote-addr")} - ${chalk.greenBright.bold(":method")} :url ${chalk.yellowBright("HTTP/:http-version")} (:status)`;
    });

    morgan.token('remote-addr', extractRemoteAddrFromRequest);

    morgan.token('status', (req: Request, res: Response) => {
        if (res.statusCode > 400) {
            return chalk.redBright.bold(res.statusCode);
        }
        else {
            return chalk.greenBright.bold(res.statusCode);
        }
    });
    
    morgan.token('timestamp', () => {
        return `[${getISOTimestamp()}]`;
    });
    
    // Show routes called in console during development
    if (EnvVars.NodeEnv === NodeEnvs.Dev) {
        app.use(morgan('dev'));
    } else if (EnvVars.NodeEnv === NodeEnvs.Production) {
        app.use(morgan(NodeEnvs.Production));
    }

    // Security
    if (EnvVars.NodeEnv === NodeEnvs.Production) {
        app.use(helmet({contentSecurityPolicy: false,}));
    }

    // Add APIs, must be after middleware
    app.use('/', baseRouter);

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

        if (res && res.req) {
            return handleApiResponse(status, res, err);
        }

        return res.status(status).json({
            error: err.message,
        });
    });

    return app;
}

const destroy = (callback: Function) => {
    httpServer.close(() => {
        if (callback && typeof callback == 'function') {
            callback();
        }
    });
}

async function setupExpressServer(app: Application) {
    const expressUserAgent = useragent.express();
    const secret = _.get(config, 'secret') || '';

    app.use(overrideHeaders);
    
    // View engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.set('trust proxy', 1)

    // Set static directory (js and css).
    var staticDir = path.join('public');
    if (EnvVars.NodeEnv === NodeEnvs.Production) {
        staticDir = path.join(paths.buildDir, 'public');
    }
    app.use(express.static(staticDir));


    // Basic middleware
    app.use(express.json({
        limit: application.configurationStore?.maximumRequestBodySize || '1mb'
    }));
    app.use(express.urlencoded({
        extended: true,
        limit: application.configurationStore?.maximumRequestBodySize || '1mb'
    }));

    app.use(cookieParser(secret));
    app.use(overrideRender);
    app.use(function userAgent(req, res, next) {
        expressUserAgent(req, res, next);
    });

    app.use(flash());
    app.use(function (req, res, next) {
        expressSession({
            store: mongo.sessionStore,
            secret: secret,
            name: application.configurationStore?.session.name,
            cookie: cookies.setupCookie(req, res),
            resave: application.configurationStore?.session.resave || false,
            saveUninitialized: application.configurationStore?.session.saveUninitialized || false,
        })(req, res, next);
    });

    passport.serializeUser(user.serializeUser);
    passport.deserializeUser(user.deserializeUser);
    passport.use(new LocalStrategy({ passReqToCallback: true }, authentication.loginUser));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(addUserSessionAgent);
}

/**
 * @description Internationalization of the application across various screens
 * @param app 
 */
function enableAppLocalization(app: Application): void {
    app.use(i18nextMiddleware.handle(Locales.i18nextInstance));
    app.use(function (req: Request, res: Response, next: NextFunction) {
        if (req.i18n && req.t) {
            res.locals.t = req.t as TFunction;
        }
        next();
    });
}

export default {
  app,
  httpServer,
  start,
  destroy,
  initialize
};