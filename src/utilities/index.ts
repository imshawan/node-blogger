import crypto from 'crypto';
import axios from 'axios';

export * from './password';
export * from './slugify';
export * from './logger';
export * from './mimetypes';
export * from './sidebar';
export * from './sessionstore';

export const getISOTimestamp = () => new Date().toISOString();

export const generateUUID = () => { 
    return crypto.randomUUID();
}

export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const resolveGeoLocation = async (ipAddr: string): Promise<string> => {
    const ipLookupUrl = 'http://ip-api.com/json/';
    const response: any = await axios.get(`${ipLookupUrl}${ipAddr}`);
    let geoLocation = 'Unknown';

    if (response.data && Object.keys(response.data).length) {
        let ipLookup = [];
        if (Object.hasOwnProperty.bind(response.data)('city')) {
            ipLookup.push(response.data.city)
        }
        if (Object.hasOwnProperty.bind(response.data)('country')) {
            ipLookup.push(response.data.country);
        }
        
        if (ipLookup.length) {
            geoLocation = ipLookup.join(', ');
        }
    }

    return geoLocation;
}