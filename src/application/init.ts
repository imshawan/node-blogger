import _ from 'lodash';
import { IApplication, AppKeysArray, MutableObject } from '@src/types';
import { database } from '@src/database';
import { Logger } from '@src/utilities';

const {info} = new Logger();
const filterApplicationKeys: AppKeysArray = ['_id', '_key'];
const protectedApplicationKeys: AppKeysArray = ['cookie', 'cors', 'session', 'xPoweredByHeaders'];

export const application: {configurationStore?: IApplication} = {};

export const get = function (field: string) {
    if (application.configurationStore && Object.hasOwnProperty.bind(application.configurationStore)(field)) {
        // @ts-ignore
        return application.configurationStore[field];
    }
}

export const getConfigurationStoreByScope = function (scope?: 'admin' | 'client') {
    const store: MutableObject = {};
    if (!scope) {
        scope = 'client';
    }
    if (application.configurationStore) {
        const keys = Object.keys(application.configurationStore) as (keyof IApplication)[];
        let filterKeys: AppKeysArray = [];

        if (scope == 'admin') {
            filterKeys = filterApplicationKeys;
        } else {
            filterKeys = protectedApplicationKeys.concat(filterApplicationKeys);
        }

        keys.forEach((key: keyof IApplication) => {
            if (!filterKeys.includes(key)) {
                store[key] = application.configurationStore && application.configurationStore[key];
            }
        });

    }

    return store;
}

export const set = function(key: keyof IApplication, value: any) {
    if (!key) {
        throw new Error('key is required');
    }

    Object.assign(application.configurationStore || {}, {[key]: value});
}

export const initialize = async function initialize() {
    const _key = 'global:application';
    const defaults =  require('../../setup/data/defaults.json');
    const applicationExists = await database.getObjects({_key});
    if (!applicationExists) {
        const applicationInfo = _.merge({_key}, defaults);
        await database.setObjects(applicationInfo);
        application.configurationStore = applicationInfo;
    } else {
        application.configurationStore = applicationExists;
    }

    info('Application configuration store loaded');
}

export const reInitialize = async function reInitialize() {
    const _key = 'global:application';
    const applicationInfo = await database.getObjects({_key});
    application.configurationStore = applicationInfo;
}