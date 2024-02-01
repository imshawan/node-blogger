import { MutableObject, IPagination, IPaginationItem } from "@src/types";
import {url as Utilities} from "@src/utilities/url";

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
    const currentPageUrl = Utilities.urlQueryBuilder(baseUrl, {page});
    const nextPageUrl = page < totalPages ? Utilities.urlQueryBuilder(baseUrl, {page: page + 1}) : null;
    const prevPageUrl = page > 1 ? Utilities.urlQueryBuilder(baseUrl, {page: page - 1}) : null;

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
 * @date 08-01-2024
 * @author imshawan <hello@imshawan.dev>
 * @function generatePaginationItems
 * @description Generates an array of pagination items based on the current page, total pages, and optional parameters.
 *
 * @param {number} currentPage - The current page number.
 * @param {number} totalPages - The total number of pages.
 * @param {number} adjacentPages - The number of page numbers to show on each side of the current page (default: 2).
 * @returns An array of PaginationItem objects representing pagination items, including page numbers and ellipses.
 * 
 * @example     
 *  const currentPage = 10;
    const totalPages = 84;
    const adjacentPages = 2;

    const paginationItems = generatePaginationItems(currentPage, totalPages, adjacentPages);
    console.log(paginationItems);
 */

export function generatePaginationItems(baseUrl: string, currentPage: number, totalPages: number, adjacentPages: number = 2): IPaginationItem {
    if (isNaN(Number(currentPage))) {
        throw new Error('currentPage must be a number, found ' + typeof currentPage);
    }
    if (isNaN(Number(totalPages))) {
        throw new Error('totalPages must be a number, found ' + typeof totalPages);
    }
    if (isNaN(Number(adjacentPages))) {
        throw new Error('adjacentPages must be a number, found ' + typeof adjacentPages);
    }

    const paginationItems: IPaginationItem = {
        items: [],
        navigation: {
            previous: {},
            next: {}
        }
    };

    const addPaginationItem = (pageNumber: number | string, isCurrent: boolean = false) => {
        let url = isNaN(Number(pageNumber)) ? '' : Utilities.urlQueryBuilder(baseUrl, {page: pageNumber});
        paginationItems.items.push({
            pageNumber,
            isCurrent,
            url,
        });
    };

    // Add page numbers and ellipses
    for (let i = 1; i <= totalPages; i++) {
        if (i <= adjacentPages || i > totalPages - adjacentPages || (i >= currentPage - adjacentPages && i <= currentPage + adjacentPages)) {
            addPaginationItem(i, i === currentPage);
        } else if (
            paginationItems.items[paginationItems.items.length - 1]?.pageNumber !== '...' &&
            i > adjacentPages &&
            i < currentPage - adjacentPages
        ) {
            addPaginationItem('...'); // Ellipsis before current page
        } else if (
            paginationItems.items[paginationItems.items.length - 1]?.pageNumber !== '...' &&
            i > currentPage + adjacentPages &&
            i < totalPages - adjacentPages
        ) {
            addPaginationItem('...'); // Ellipsis after current page
        }
    }

    paginationItems.items.forEach((item, index) => {
        if (item.isCurrent) {
            let previous = paginationItems.items[index - 1] || {};
            let next = paginationItems.items[index + 1] || {};
            
            if (previous.pageNumber) {
                paginationItems.navigation.previous = {
                    pageNumber: previous.pageNumber,
                    url: Utilities.urlQueryBuilder(baseUrl, {page: previous.pageNumber}),
                }
            }
            if (next.pageNumber) {
                paginationItems.navigation.next = {
                    pageNumber: next.pageNumber,
                    url: Utilities.urlQueryBuilder(baseUrl, {page: next.pageNumber}),
                }
            }
        }
    });

    return paginationItems;
}