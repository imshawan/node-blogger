import { Request, Response } from 'express';
import _ from 'lodash';
import nconf from 'nconf';
import { application } from './init';

export const getTTLSessionSeconds = () => {
    var maxTTLDays = application.configurationStore?.cookie.maxTTLDays;
    if (!maxTTLDays) {
        maxTTLDays = 12;
    }
    
    return (60000 * 60 * 60) * 24 * maxTTLDays;
}

export const cookies = {
    get: function (): object {
        let domain = nconf.get('host');
        let {host} = new URL(domain);

        const cookie = {
            domain: host,
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