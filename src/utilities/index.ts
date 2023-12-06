import crypto from 'crypto';
import axios from 'axios';
import _ from 'lodash';
import { MutableObject, IMongoConnectionProps } from '@src/types';

export * from './password';
export * from './slugify';
export * from './logger';
export * from './mimetypes';
export * from './sidebar';
export * from './sessionstore';
export * from './changelog';

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

export const parseBoolean = function(value: any) {
    if (!value) return false;

    if (Array.isArray(value)) {
        return Boolean(value.length);
    }
    if (typeof value == 'object') {
        return Boolean(Object.keys(value).length);
    }

    try {
        value = JSON.parse(String(value).toLowerCase().trim());
    } catch (err) {
        value = false;
    }

    return value;
}

export const isParsableJSON = function (jsonString?: string) {
    if (!jsonString) return false;
    
    try {
        JSON.parse(jsonString);
        return true;
    } catch (err) {
        return false;
    }
}

export const getArgv = function (key: string): string | Number | Boolean {
    const args = process.argv;
    const parsedArgs: MutableObject = {};
    
    // Start from index 2 to skip "node" and the script name
    for (let i = 2; i < args.length; i++) { 
        const arg = args[i];

        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            parsedArgs[key] = value || true;
        }
    }

    const value = parsedArgs[key];
    if (value) {
        if (!isNaN(value)) return Number(value);
        return value;
    } else return '';
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

export const sanitizeHtml = function (inputHtml: string, unsafeTags = ['script', 'iframe']) {
    const tagRegex = new RegExp(`<(${unsafeTags.join('|')})\\b[^<]*(?:(?!<\\/\\1>)<[^<]*)*<\\/\\1>`, 'gi');
    const safeHtml = inputHtml.replace(tagRegex, '');

    const sanitizedHtml = safeHtml.replace(/on\w+="[^"]*"/gi, '');
  
    // Remove attributes that may contain JavaScript code
    const attributeRegex = /(?:\s|^)(on\w+|href|src)\s*=\s*("[^"]*"|'[^']*'|[^>\s]+)/gi;
    const finalSanitizedHtml = sanitizedHtml.replace(
      attributeRegex,
      (match, attributeName, attributeValue) => {
        if (
          attributeName.toLowerCase() === "on" ||
          attributeValue.toLowerCase().includes("javascript:")
        ) {
          return "";
        } else {
          return match;
        }
      }
    );
  
    return finalSanitizedHtml;
  }