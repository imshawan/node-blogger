import { Request, Response } from 'express';
import _ from 'lodash';
import { meta } from './init';

export const getTTLSessionSeconds = () => {
    var maxTTLDays = meta.configurationStore?.cookie.maxTTLDays;
    if (!maxTTLDays) {
        maxTTLDays = 12;
    }
    
    return (60000 * 60 * 60) * 24 * maxTTLDays;
}

export const cookies = {
    get: function (): object {
        const cookie = {
            domain: 'localhost',
            secure: false,
            path: '/',
            sameSite: 'Lax'
        };
    
        return cookie;
    },

    setupCookie: function (req: Request, res: Response): object {
        const cookie = this.get();
        const ttl = getTTLSessionSeconds();
        
        const data = {
            maxAge: ttl,
        }
    
        return _.merge(cookie, data);
    }
}