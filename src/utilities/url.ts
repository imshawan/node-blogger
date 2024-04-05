import { MutableObject } from "@src/types";

/**
 * 
 * @author imshawan
 * @date 03-10-2023
 * 
 * @function urlQueryBuilder
 * @param baseURL
 * @param params 
 * @description function takes a base URL with an existing query string and additional query parameters as input. 
 * It combines the base URL and the new parameters, ensuring proper formatting with encoded query parameters.
 */
const urlQueryBuilder = function (baseURL: string, params: MutableObject = {}): string {
    if (!baseURL) {
        throw new Error('baseUrl is a required parameter');
    }
    if (typeof baseURL != 'string') {
        throw new TypeError('baseUrl must be a string, found ' + typeof baseURL);
    }
    if (!Object.keys(params)) {
        return baseURL;
    }

    baseURL = String(baseURL).trim();

    const urlParts = baseURL.split('?');
    const baseUrl = urlParts[0];
    let queryString = urlParts[1] || '';

    const queryParams = new URLSearchParams(queryString);

    for (const [key, value] of Object.entries(params)) {
        queryParams.set(key, value);
    }

    queryString = queryParams.toString();

    const updatedUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    return updatedUrl;
}

const removeQueryParamByKey = function (url: string, key: string) {
    const urlParts = url.split('?'); 
    if (urlParts.length < 2) {
        return url;
    }

    const baseUrl = urlParts[0];
    const queryString = urlParts[1];
    const queryParams = queryString.split('&');

    // Filter out the parameter to remove
    const updatedParams = queryParams.filter(param => {
        const [key, value] = param.split('=');
        return key !== key; 
    });

    const updatedQueryString = updatedParams.join('&');
    const updatedUrl = updatedQueryString ? `${baseUrl}?${updatedQueryString}` : baseUrl;

    return updatedUrl;
}

const hasQueryParam = function (url: string, key: string) {
    const queryStringIndex = url.indexOf('?');
    if (queryStringIndex === -1) {
        return false;
    }

    const queryString = url.slice(queryStringIndex + 1); // Extract query string
    const queryParams = queryString.split('&');

    for (const param of queryParams) {
        const [key, value] = param.split('=');
        if (key === key) {
            return true;
        }
    }

    return false;
}

const extractHostname  = function(urlString: string) {
    if (!urlString) {
        return null;
    }

    const regex = /^(https?:\/\/[^/]+)\//;
    const match = urlString.match(regex);
    if (match) {
        return match[1];
    }
    return null;
}

export const url = {hasQueryParam, removeQueryParamByKey, urlQueryBuilder, extractHostname};