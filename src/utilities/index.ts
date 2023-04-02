import crypto from 'crypto';

export * from './password';
export * from './slugify';

export const getISOTimestamp = () => new Date().toISOString();

export const generateUUID = () => { 
    return crypto.randomUUID();
}