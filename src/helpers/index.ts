import { Request } from 'express';
import _ from 'lodash';
import nconf from 'nconf';
import { validateMongoConnectionUrl } from '@src/utilities';
import { ValueError } from './errors';
import { ExpressUser } from '@src/types';

export * from './routes';
export * from './response';
export * from './network';
export * from './paginate';
export * from './errors';
export * from './webmanifest';

export const validateConfiguration = function validateConfiguration (configuration: any) {
    if (!Object.keys(configuration).length) {
      throw new Error('Configuration file is empty, cannot move ahead with it');
    }
  
    if (!configuration.hasOwnProperty('secret')) {
      throw new Error('Secret key is required to init sessions');
    }
  
    if (!configuration.hasOwnProperty('mongodb')) {
        throw new Error('Database configurations missing from the configuration');
    }

    validateMongoConfiguration(configuration.mongodb);

    if (nconf.get('env') === 'test') {
        validateUnitTestConfiguration(configuration);
    }
}

export const validateUnitTestConfiguration = function validateUnitTestConfiguration (configuration: any) {
    if (!Object.hasOwnProperty.bind(configuration)('test')) {
        throw new Error('The test configuration seems to be missing from the config file');
    }
    if (!Object.hasOwnProperty.bind(configuration.test)('mongodb')) {
        throw new Error('MongoDB configuration is missing from the config file');
    }

    validateMongoConfiguration(configuration.test?.mongodb || {});
}

export const validateMongoConfiguration = function validateMongoConfiguration (mongoConf: {[key: string]: any}) {
    if (!mongoConf || !Object.keys(mongoConf).length) {
        throw new Error('MongoDB configurations is missing or is empty');
    }

    if (!mongoConf.hasOwnProperty('uri')) {
        throw new Error('Database connection URI missing from the configuration');
    }

    if (!validateMongoConnectionUrl(mongoConf.uri)) {
        throw new ValueError('Invalid MongoDB connection URL.');
    }

    if (!mongoConf.hasOwnProperty('db')) {
        throw new Error('Database name is missing from the configuration');
    }
}

export const validatePaginationControls = function validatePaginationControls (req: Request) {
    let {perPage, page} = req.query;

    if (!perPage) {
        perPage = '10';
    }
    if (_.isNaN(perPage)) {
        throw new TypeError('perPage must be a number, found ' + typeof perPage)
    }
    if (!page) {
        page = '1';
    }
    if (_.isNaN(page)) {
        throw new TypeError('page must be a number, found ' + typeof page)
    }

    return {
        perPage: Number(perPage),
        page: Number(page),
    }
}

export const parseUserId = (req: Request): number => {
    const user = req.user as ExpressUser;
    if (user && Object.hasOwnProperty.bind(user)('userid')) {
        return Number(user.userid);
    }

    return 0;
}

export const validateHtml = (html: string): Array<string> => {
    const errors: Array<string> = [];
    const tagsStack: Array<string> = [];

    const selfClosingTags: Array<string> = [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'param', 'source', 'track', 'wbr'
    ];

    const regex = /<\s*([a-zA-Z0-9]+)[^>]*>|<\/\s*([a-zA-Z0-9]+)[^>]*>/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
        const openingTag = match[1];
        const closingTag = match[2];

        if (openingTag) {
            if (selfClosingTags.includes(openingTag.toLowerCase())) {
                // Self-closing tag found
                continue;
            }
            tagsStack.push(openingTag.toLowerCase());
        } else if (closingTag) {
            const lastTag = tagsStack.pop();
            if (!lastTag || lastTag !== closingTag.toLowerCase()) {
                errors.push(`Mismatched tag: </${closingTag}>`);
            }
        }
    }

    // Check if any unclosed tags are left in the stack
    if (tagsStack.length > 0) {
        errors.push(`Unclosed tags: ${tagsStack.map(tag => `<${tag}>`).join(', ')}`);
    }

    return errors;
}

export const isValidHtml = (htmlString: string): boolean => {
    return !Boolean(validateHtml(htmlString).length);
}