import crypto from 'crypto';
import _ from 'lodash';
import { MutableObject, TimeUnitSuffix } from '@src/types';
import { execSync } from 'child_process';
import { createCanvas, registerFont } from 'canvas';
import path from 'path';

export * from './password';
export * from './slugify';
export * from './logger';
export * from './mimetypes';
export * from './sidebar';
export * from './sessionstore';
export * from './changelog';
export * from './url';
export * from './types';
export * from './network';
export * from './process';

export const getISOTimestamp = () => new Date().toISOString();

export const ipV4Regex = /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;

export const generateUUID = () => {
    return crypto.randomUUID();
}

export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const parseBoolean = function (value: any) {
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

export const filterObjectByKeys = function (obj: MutableObject, keys: string[]) {
    if (!Object.keys(obj).length) return obj;
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([key]) => keys.includes(key))
    );
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

export const isGraphicalEnvironmentAvailable = (): boolean => {
    return !!(process.env.DISPLAY && process.env.XDG_SESSION_TYPE);
}

export const openWebUrl = (url: string) => {
    if (!isGraphicalEnvironmentAvailable()) {
        return;
    }

    const command = process.platform === 'darwin' ? `open ${url}` :
        process.platform === 'win32' ? `start ${url}` : `xdg-open ${url}`;

    execSync(command);
}

export const calculateReadTime = function (content: string, suffix: TimeUnitSuffix) {
    const averageWordsPerMinute = 185;
    const wordCount = String(content).split(' ').length;

    if (!wordCount) return 0;

    const readTimeInMinutes = wordCount / averageWordsPerMinute;

    let readTime: number = 0;
    switch (suffix) {
        case 'ms':
        case 'msec':
            readTime = readTimeInMinutes * 60 * 1000; // Convert minutes to milliseconds
            break;

        case 'milli':
        case 'millisecond':
            readTime = readTimeInMinutes * 60 * 1000; // Convert minutes to milliseconds
            break;

        case 'sec':
        case 'second':
            readTime = readTimeInMinutes * 60; // Convert minutes to seconds
            break;

        case 'min':
        case 'minute':
            readTime = readTimeInMinutes;
            break;

        default:
            readTime = readTimeInMinutes;
            break;
    }

    const roundedReadTime = Math.ceil(readTime);
    return roundedReadTime;
}

export const textFromHTML = function (html: string) {
    if (!html) return '';
    html = html
        .replace(/\n/ig, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style[^>]*>/ig, '')
        .replace(/<head[^>]*>[\s\S]*?<\/head[^>]*>/ig, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script[^>]*>/ig, '')
        .replace(/<\/\s*(?:p|div)>/ig, '\n')
        .replace(/<br[^>]*\/?>/ig, '\n')
        .replace(/<[^>]*>/ig, '')
        .replace('&nbsp;', ' ')
        .replace(/[^\S\r\n][^\S\r\n]+/ig, ' ');

    return sanitizeMultiChars(html);
}

/**
 * 
 * @function sanitizeMultiChars
 * @description Fixes Incomplete multi-character sanitization
 * 
 * Regular expression matches multiple consecutive characters, replacing it just once can result in the unsafe text reappearing 
 * in the sanitized input. 
 * If the input string is "<scrip<script>is removed</script>t>alert(123)</script>", the output will be "<script>alert(123)</script>", 
 * which still contains a script tag.
 * 
 * @param html 
 * @returns {string}
 */

export const sanitizeMultiChars = function (html: string) {
    if (!html) return '';
    return html.replace(/<!--[\s\S]*?-->/ig, '').replace(/<[^>]*>/ig, '');
}

export const clipContent = function (content: string, wordLimit: number) {
    if (!content || !content.length) return '';

    const match = content.match(new RegExp(`^(\\S+\\s*){1,${wordLimit}}`));
    return match ? match[0] : content;
}

export const abbreviateNumber = function (num: number) {
    if (num < 1000) {
        return num.toString();
    } else if (num < 1000000) {
        return (num / 1000).toFixed(1) + "K";
    } else if (num < 1000000000) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (num < 1000000000000) {
        return (num / 1000000000).toFixed(1) + "B";
    } else {
        return (num / 1000000000000).toFixed(1) + "T";
    }
}

export const generateAvatarFromInitials = function (name: string, size: number = 200) {
    const colours = [
        "#1abc9c",
        "#2ecc71",
        "#3498db",
        "#9b59b6",
        "#34495e",
        "#16a085",
        "#27ae60",
        "#2980b9",
        "#8e44ad",
        "#2c3e50",
        "#f1c40f",
        "#e67e22",
        "#e74c3c",
        "#95a5a6",
        "#f39c12",
        "#d35400",
        "#c0392b",
        "#bdc3c7",
        "#7f8c8d",
    ];

    const canvas = createCanvas(size, size);
    const context = canvas.getContext('2d');

    const nameSplit = name.split(" ");
    let initials = nameSplit[0].charAt(0).toUpperCase();
    if (nameSplit.length > 1) {
        initials += nameSplit[1].charAt(0).toUpperCase();
    }

    const charIndex = initials.charCodeAt(0) - 65,
        colourIndex = charIndex % 19;

    context.fillStyle = colours[colourIndex];;
    context.fillRect(0, 0, size, size);

    context.fillStyle = '#fff';
    context.font = `${Math.floor(size / 2)}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(initials, size / 2, size / 2);

    const base64 = canvas.toDataURL('image/png')

    return base64;
}

export const excapeRegExp = function (content: string) {
    if (!content || !content.length) return content;
    return content.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export const encodeToBase64 = function (string: string) {
    if (!string || !string.length) return string;
    return Buffer.from(string).toString('base64');
}

export const decodeBase64ToString = function (base64Data: string) {
    if (!base64Data || !base64Data.length) return base64Data;
    return Buffer.from(base64Data, 'base64').toString('utf-8');
}

export const sanitizeString = function (str: string, replaceWith: string = '-') {
    return str.replace(':', replaceWith)
}

export const resolveFilename = (context: string, removeExt: boolean = true) => {
    let filename = path.basename(context);
    if (removeExt) {
        return filename.split('.').shift();
    }

    return filename;
}


/**
 * @date 28-04-2024
 * @author imshawan <github@imshawan.dev>
 * 
 * @function generateTOTP
 * @description Generates a time-based one-time password (TOTP) with an additional random alphabet inserted at a random position.
 * @param {number} length - The length of the OTP to be generated.
 * @returns {string} The generated OTP with the specified length.
 */
export const generateTOTP = function (length: number = 6): string {
    const timestamp = Date.now();
    const maxOTPValue = Math.pow(10, length - 1) - 1;
    const random = crypto.getRandomValues(new Uint32Array(1))[0];
    const randomOTP = Math.floor(random * maxOTPValue).toString().padStart(length - 1, '0');

    // Convert timestamp to a string and extract last 'length' digits
    const timeComponent = (timestamp % Math.pow(10, length)).toString().padStart(length, '0');

    // Combine random OTP and time-based component
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += randomOTP[i % (length - 1)] + timeComponent[i];
    }

    // Determine the frequency of the extra alphabet
    const frequency = Math.min(Math.floor(length / 4), 4);

    // Generate alphabets with the determined frequency
    let alphabets = '';
    for (let i = 0; i < frequency; i++) {
        alphabets += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    }

    // Generate a random position to insert the alphabets
    const position = Math.floor(Math.random() * length);
    const otpWithAlphabets = otp.slice(0, position) + alphabets + otp.slice(position);

    return String(otpWithAlphabets).substring(0, length);
}

export const timeAgo = function (date: Date | number | string) {
    if (typeof date === 'number' || typeof date === 'string') {
        date = new Date(date);
    }

    const seconds: number = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    let interval: string;
    for (interval in intervals) {
        const timePeriod: number = Math.floor(seconds / intervals[interval]);
        if (timePeriod >= 1) {
            if (timePeriod > 1) {
                return `${timePeriod} ${interval}s ago`;
            } else {
                return `${timePeriod} ${interval} ago`;
            }
        }
    }
    return 'Just now';
}