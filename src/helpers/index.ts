import { Request } from 'express';
import _ from 'lodash';

export * from './routes';
export * from './response';
export * from './network';
export * from './paginate';
export * from './errors';

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

    const {mongodb} = configuration;
    if (!Object.keys(mongodb).length) {
        throw new Error('Mongodb configurations are empty');
    }

    if (!mongodb.hasOwnProperty('uri')) {
        throw new Error('Database connection URI missing from the configguration');
    }

    if (!mongodb.hasOwnProperty('db')) {
        throw new Error('Database name is missing from the configguration');
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