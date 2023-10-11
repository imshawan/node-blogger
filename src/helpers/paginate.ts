import { MutableObject, IPagination } from "@src/types";

/**
 * 
 * @author imshawan
 * @date 03-10-2023
 * 
 * @function paginate
 * @param items 
 * @param perPage 
 * @param page 
 * @param baseUrl 
 * @description facilitates pagination for a given array of items, allowing users to navigate through the data in smaller, manageable chunks. 
 * It takes an array of items, the number of items to display per page (perPage), the current page number (page), and a base URL (baseUrl) as inputs.
 */
export function paginate(items: Array<any>, perPage: number, page: number, baseUrl: string=''): IPagination {
    if (!items) {
        items = [];
    }
    if (!Array.isArray(items)) {
        throw new TypeError('Invalid input. Items should be an array');
    }
    if (typeof perPage !== 'number') {
        throw new TypeError('Invalid input. perPage should be number');
    }
    if (typeof page !== 'number') {
        throw new TypeError('Invalid input. page should be number');
    }
    if (page==0) {
        throw new Error('page must be non zero (0) number');
    }
    if (!baseUrl) {
        throw new Error('baseUrl is a required parameter');
    }
    if (typeof baseUrl != 'string') {
        throw new TypeError('baseUrl must be a string, found ' + typeof baseUrl);
    }
  
    perPage = Number(perPage);
    page = Number(page);

    const startIndex = (page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, items.length);
  
    // Calculate the total number of pages
    const totalPages = Math.ceil(items.length / perPage);
  
    // Generate URLs for the current, next, and previous pages
    const currentPageUrl = urlQueryBuilder(baseUrl, {page});
    const nextPageUrl = page < totalPages ? urlQueryBuilder(baseUrl, {page: page + 1}) : null;
    const prevPageUrl = page > 1 ? urlQueryBuilder(baseUrl, {page: page - 1}) : null;

    const navigation = {current: currentPageUrl, next: nextPageUrl, previous: prevPageUrl};
  
    return {
        data: items,
        currentPage: page,
        perPage: perPage,
        totalPages: totalPages,
        totalItems: items.length,
        navigation,
        start: startIndex,
        end: endIndex
    };
  }
  
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
export function urlQueryBuilder(baseURL: string, params: MutableObject = {}): string {
    if (!baseURL) {
        throw new Error('baseUrl is a required parameter');
    }
    if (typeof baseURL != 'string') {
        throw new TypeError('baseUrl must be a string, found ' + typeof baseURL);
    }
    if (!Object.keys(params)) {
        return baseURL;
    }

    let finalURL = String(baseURL).trim();

    const queryString = Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');

    if (queryString) {
        finalURL += (finalURL.includes('?') ? '&' : '?') + queryString;
    }

    return finalURL;
}