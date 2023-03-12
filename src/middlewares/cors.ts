import cors from 'cors';
import { Request } from 'express';

const whitelist = ['http://localhost:3000'];
var corsOptionsDelegate = (req: Request, callback: Function) => {
    const origin = req.header('Origin');
    var corsOptions;

    if(origin && whitelist.indexOf(origin) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

const CORS = cors();
const corsWithOptions = cors(corsOptionsDelegate);

export {
    CORS, corsWithOptions
};