/**
 * Setup express server.
 */

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, {Request, Response, NextFunction, Application} from 'express';
import http from 'http';
import logger from 'jet-logger';
import useragent from 'express-useragent';
import expressSession from 'express-session';

import 'express-async-errors';

import baseRouter from '@src/routes';
import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import {NodeEnvs} from '@src/constants/misc';
import {RouteError} from '@src/other/classes';
import { handleApiResponse, validateConfiguration } from '@src/helpers';
import { overrideRender, authentication } from '@src/middlewares';
import {initializeDbConnection, mongo, database} from './database';
import { cookies } from './meta';
import config from '../config.json';
import _ from 'lodash';
import passport from 'passport';
import passportLocal from 'passport-local';

const app = express();
const httpServer = http.createServer(app);
const start = async function (port: Number, callback: Function) {

    validateConfiguration(config)
    await initializeDbConnection(config.mongodb);
    await setupExpressServer(app);

    // Show routes called in console during development
    if (EnvVars.NodeEnv === NodeEnvs.Dev) {
        app.use(morgan('dev'));
    }

    // Security
    if (EnvVars.NodeEnv === NodeEnvs.Production) {
        app.use(helmet());
    }

    // Add APIs, must be after middleware
    app.use('/', baseRouter);

    // Add error handler
    app.use((err: Error, _: Request, res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: NextFunction,
    ) => {
        if (EnvVars.NodeEnv !== NodeEnvs.Test) {
            logger.err(err, true);
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

    app.listen(port, () => {
        if (callback && typeof callback == 'function') {
            callback()
        }
    });
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

    // View engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    // Set static directory (js and css).
    const staticDir = path.join('public');
    app.use(express.static(staticDir));

    // Basic middleware
    app.use(express.json({
        limit: '50mb'
    }));
    app.use(express.urlencoded({
        extended: true,
        limit: '50mb'
    }));
    app.use(cookieParser(secret));
    app.use(overrideRender);
    app.use(function userAgent(req, res, next) {
        expressUserAgent(req, res, next);
    });

    app.use(expressSession({
        store: mongo.sessionStore,
        secret: secret,
        // key: 'express.sid',
        cookie: cookies.setupCookie(),
        resave: false,
        saveUninitialized: false,
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(authentication.serializeUser);
    passport.deserializeUser(authentication.deserializeUser);
}

export default {
  app,
  httpServer,
  start,
  destroy
};