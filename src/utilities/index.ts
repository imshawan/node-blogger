import crypto from 'crypto';

export * from './password';
export * from './slugify';
export * from './logger';

export const getISOTimestamp = () => new Date().toISOString();

export const generateUUID = () => { 
    return crypto.randomUUID();
}

export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}