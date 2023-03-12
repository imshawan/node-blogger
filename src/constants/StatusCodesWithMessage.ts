/* eslint-disable max-len */

/**
 * Hypertext Transfer Protocol (HTTP) response status codes.
 * @see {@link https://en.wikipedia.org/wiki/List_of_HTTP_status_codes}
 */
enum StatusCodesWithMessage {
    _200 = 'OK',
    _201 = 'Created',
    _202 = 'Accepted',
    _203 = 'Non-Authoritative Information',
    _204 = 'No Content',
    _300 = 'Multiple Choices',
    _301 = 'Moved Permanently',
    _302 = 'Found',
    _303 = 'See Other',
    _304 = 'Not Modified',
    _400 = 'Bad Request',
    _401 = 'Unauthorized',
    _402 = 'Payment Required',
    _403 = 'Forbidden',
    _404 = 'Not Found',
    _405 = 'Method Not Allowed',
    _406 = 'Not Acceptable',
    _407 = 'Proxy Authentication Required',
    _408 = 'Request Timeout',
    _500 = 'Internal Server Error',
    _501 = 'Not Implemented',
    _502 = 'Bad Gateway',
    _503 = 'Service Unavailable',
    _504 = 'Gateway Timeout'
}

export {StatusCodesWithMessage};