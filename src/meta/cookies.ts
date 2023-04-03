import _ from 'lodash';

export const getTTLSessionSeconds = () => {
    return (60000 * 60 * 60) * 24 * 14;
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

    setupCookie: function (): object {
        const cookie = this.get();
        const ttl = getTTLSessionSeconds();
        
        const data = {
            maxAge: ttl,
        }
    
        return _.merge(cookie, data);
    }
}