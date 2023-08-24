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