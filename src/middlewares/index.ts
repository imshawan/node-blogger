import { NextFunction, Response, Request } from 'express';
import { handleApiResponse, extractRemoteAddrFromRequest } from '@src/helpers';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import csurf from 'csurf';
import { isAdministrator } from '@src/user';
import { NodeEnvs } from '@src/constants/misc';
import EnvVars from '@src/constants/EnvVars';
import { MulterFilesArray } from '@src/types';
import nconf from 'nconf';
import { NavigationManager } from '@src/utilities/navigation';

export * from './cors';
export * from './overrides';
export * from './authentication';
export * from './user';
export * from './breadcrumb';
export * from './filestore';
export * from './multiparty';
export * from './routes';

export const checkRequiredFields = function (fields: Array<string>, req: Request, res: Response, next: NextFunction) {
    if (fields && !Array.isArray(fields)) {
        throw new Error('fields required to be checked must be in an array');
    }
    
    let missingFields: Array<string> = [];
    if (fields.length) {
        fields.forEach((field) => {
            if (!Object.hasOwnProperty.bind(req.body)(field) || req.body[field] == '') {
                missingFields.push(field)
            }
        });
    }

    if (missingFields.length) {
        return handleApiResponse(HttpStatusCodes.BAD_REQUEST, res, new Error('Required fields were missing from the API call: ' + missingFields.join(', ')));
    } else next();
}

export const checkRequiredFileFields = function (fields: Array<string>, req: Request, res: Response, next: NextFunction) {
    if (fields && !Array.isArray(fields)) {
        throw new Error('fields required to be checked must be in an array');
    }
    let missingFileFields: Array<string> = [];
    if (fields.length) {
        if (!req.files || !req.files.length)  {
            missingFileFields = fields;
        } else {
            const files = req.files as MulterFilesArray[];
            fields.forEach((field) => {
                files.forEach(file => {
                    if (!Object.hasOwnProperty.bind(file)('fieldname') || file.fieldname != field) {
                        missingFileFields.push(field);
                    }
                })
            });
        }
    }

    if (missingFileFields.length) {
        return handleApiResponse(HttpStatusCodes.BAD_REQUEST, res, new Error('Required file fields were missing from the API call: ' + missingFileFields.join(', ')));
    } else next();
}

export const requireLogin = async function (baseRoute: string, req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated() || !req.user) {
        var originalUrl = req.url;
        if (baseRoute) {
            originalUrl = [baseRoute, originalUrl].join('');
        }
        
        return res.redirect('/signin?redirect=' + originalUrl);
    }

    next();
}

export const hasAdministratorAccess = async function (req: Request, res: Response, next: NextFunction) {
    const {user} = req;
    
    if (nconf.get('env') === 'test') {
        return next();
    }

    // @ts-ignore
    if (user && user.userid && !await isAdministrator(user.userid)) {
        res.locals.error = true;
        return res.status(HttpStatusCodes.UNAUTHORIZED).render('401', {title: '401'});
    }

    next();
}

export const requireAuthentication = async function (req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated() || !req.user) {
        return handleApiResponse(HttpStatusCodes.UNAUTHORIZED, res, new Error('A valid session key or token was not found with this API call'));
    }

    next();
}

export const isAuthenticated = function (req: Request) {
    return req.isAuthenticated() && req.user;
}

export const verifyAdministrator = async function (req: Request, res: Response, next: NextFunction) {    
    const {user} = req;

    if (nconf.get('env') === 'test') {
        return next();
    }

    // @ts-ignore
    if (user && user.userid && !await isAdministrator(user.userid)) {
        return handleApiResponse(HttpStatusCodes.UNAUTHORIZED, res, new Error('Unauthorized! Protected administrator route'));
    }

    next();
}

export const applyCSRFMiddleware = async function (req: Request, res: Response, next: NextFunction) {
    // No need of CSRF if the server is running tests?
    if (EnvVars.NodeEnv === NodeEnvs.Test) {
        return next();
    }

    // TODO
    // Need to implement cookie options based on the config (https or not and etc)
    const csurfOptions = {
        cookie: true,
    };

    if (req.user) {
        csurf(csurfOptions)(req, res, function(err) {
            if (err) {
                switch (err.code) {
                    case 'EBADCSRFTOKEN':
                        return handleApiResponse(HttpStatusCodes.FORBIDDEN, res);
                    
                    default:
                        return handleApiResponse(HttpStatusCodes.FORBIDDEN, res, new Error('Invalid csrf token'));
                }
            } else {
                return next();
            }
        });
    } else {
        return next();
    }
}

export function addUserSessionAgent(req: Request, res: Response, next: NextFunction) {
    const { useragent } = req;
    // @ts-ignore
    const { browser, version, os, platform } = useragent;

    if (req.session.hasOwnProperty('passport')) {
        // @ts-ignore
        if (typeof req.session.passport !== 'object') {
            // @ts-ignore
            req.session.passport = {};
        }
        // @ts-ignore
        req.session.passport.agent = {
            browser,
            version,
            os,
            platform,
            ip: extractRemoteAddrFromRequest(req)
        };
    }

    next();
}

export const notFoundHandler = async function (req: Request, res: Response) {
    const navigation = new NavigationManager().get();
    res.locals.error = true;
    res.status(HttpStatusCodes.NOT_FOUND).render('404', {title: '404', navigation});
}