import cors from 'cors';
import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { application } from '@src/application';
import { CorsOptions } from '@src/types';

const getCorsOptions = function getCorsOptions() {
    const corsOps: CorsOptions = application.configurationStore?.cors || {
        allowedHeaders: undefined,
        credentials: true
        ,
    };
    return {
        allowedHeaders: corsOps.allowedHeaders,
        credentials: corsOps.credentials,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
    };
}

const corsOptionsDelegate = (req: Request, callback: Function) => {
    const whitelist = (application.configurationStore?.cors.whitelistOrigins || "*").split(',').map(e => e.trim());
    const origin = req.header('Origin');
    var corsOriginOptions = { origin: true };

    if(origin && whitelist.indexOf(origin) !== -1) {
        corsOriginOptions = { origin: true };
    }
    else {
        corsOriginOptions = { origin: false };
    }

    const options = _.merge(corsOriginOptions, getCorsOptions());
    callback(null, options);
};

const initializeCors = async function initializeCors(req:Request, res: Response, next: NextFunction) {
    const corsOptions = {}
    cors(corsOptions)(req, res, next);
}
const corsWithOptions = cors(corsOptionsDelegate);

export {
    initializeCors, corsWithOptions
};