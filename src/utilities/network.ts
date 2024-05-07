import { Request } from 'express';
import network from 'net';
import axios from 'axios';
import { IMongoConnectionProps } from '@src/types';

export const ipV4Regex = /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;

export const resolveIpAddrFromHeaders = function (req: Request) {
    const headersToLookFor = [
        'x-client-ip',
        'x-forwarded-for',
        'cf-connecting-ip',
        'do-connecting-ip',
        'fastly-client-ip',
        'true-client-ip',
        'x-real-ip',
        'x-cluster-client-ip',
        'x-forwarded',
        'forwarded-for',
        'forwarded',
        'x-appengine-user-ip'
    ];
    const headers = req.headers;

    const getClientIpFromXForwardedHeader = (header: string | string[]) => {
        if (!header) {
            return null;
        }

        if (Array.isArray(header)) {
            header = header.join(',');
        }
    
        const ips = header.split(',').filter(ip => ipV4Regex.test(ip));
        const clientIp = ips[0].trim();
        return clientIp;
    }

    if (headers['x-forwarded-for']) {
        let headerValue = getClientIpFromXForwardedHeader(headers['x-forwarded-for']);
        if (headerValue) return headerValue;
    }

    let value: string | string[] | undefined = '';
    for (const element of headersToLookFor) {
        if (headers[element]) {
            value = headers[element];
            break;
        }
    }

    if (Array.isArray(value) && value.length) {
        value = String(value[0]).trim();
    }

    if (ipV4Regex.test(String(value))) {
        return String(value).trim();
    } else {
        return null;
    }
}

export const resolveIpFromRequest = function (req: Request) {
    let ip: string | null = req.ip;
    if (ipV4Regex.test(ip)) {
        return String(ip).trim();
    }

    let ips = ip.split(':').find(e => ipV4Regex.test(e));
    if (ips) {
        return ips
    } else return null;
}

export const resolveGeoLocation = async (ipAddr: string): Promise<{[key: string]: any;}> => {
    const ipLookupUrl = 'http://ip-api.com/json/';
    const response: any = await axios.get(`${ipLookupUrl}${ipAddr}`);
    const geoLocation = {
        city: 'Unknown',
        country: 'Unknown',
        countryCode: '',
    };

    if (response.data && Object.keys(response.data).length) {
        
        if (Object.hasOwnProperty.bind(response.data)('city')) {
            geoLocation.city = response.data.city;
        }
        if (Object.hasOwnProperty.bind(response.data)('country')) {
            geoLocation.country = response.data.country;
        }
        if (Object.hasOwnProperty.bind(response.data)('countryCode')) {
            geoLocation.country = response.data.country;
        }
    }

    return geoLocation;
}

export const validateMongoConnectionUrl = function (url: string): IMongoConnectionProps | null {
    const regex = /^(mongodb\+srv:\/\/)(.*?):(.*?)@(.*?)\/?$/;
    const match = url.match(regex);

    if (match && match.length === 5) {
        const [, protocol, username, password, clusterAddress] = match;
        return {
            protocol,
            username,
            password,
            clusterAddress
        };
    } else {
        return null;
    }
}

export const isPortAvailable = (port: number): Promise<boolean> => {
    if (!port) {
        throw new Error('Port is a required parameter');
    }
    if (typeof port != 'number') {
        throw new Error('Port must be a number,found ' + typeof port);
    }

    return new Promise((resolve) => {
        const connSocket = network.createConnection({port: Number(port)}, function () {
            connSocket.end();
            resolve(false)
        });

        connSocket.on('error', () => {
            resolve(true);
        });
    });
}