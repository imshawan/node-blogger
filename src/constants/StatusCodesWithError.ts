/* eslint-disable max-len */

/**
 * Hypertext Transfer Protocol (HTTP) response status codes.
 * @see {@link https://en.wikipedia.org/wiki/List_of_HTTP_status_codes}
 */
enum StatusCodesWithError {
    _400 = 'Bad Request! Smething went wrong, please check your API request',
    _401 = 'Unauthorized access!',
    _403 = 'Forbidden! You are not authorized for making this API call',
    _404 = 'The API endpoint wasn\'t not found on our server',
    _500 = 'The server encountered an error and was unable to process this request',
}

export {StatusCodesWithError};