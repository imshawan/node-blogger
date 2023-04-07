import { NextFunction, Response, Request } from 'express';
import { handleApiResponse } from '@src/helpers';

export * from './cors';
export * from './overrides';
export * from './authentication';
export * from './user';
export * from './breadcrumb';

export const checkRequiredFields = function (fields: Array<string>, req: Request, res: Response, next: NextFunction) {
    if (fields && !Array.isArray(fields)) {
        throw new Error('fields required to be checked must be in an array');
    }
    
    let missingFields: Array<string> = [];
    if (fields.length) {
        fields.forEach((field) => {
            if (!req.body[field] || req.body[field] == '') {
                missingFields.push(field)
            }
        });
    }

    if (missingFields.length) {
        return handleApiResponse(400, res, new Error('Required fields were missing from the API call: ' + missingFields.join(', ')));
    } else next();
}

export const requireLogin = async function (req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated() || !req.user) {
        return res.redirect('/signin?redirect=' + req.url);
    }

    next();
}

export const checkAuthentication = async function (req: Request, res: Response, next: NextFunction) {
    
}