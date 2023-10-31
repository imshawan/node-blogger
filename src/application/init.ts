import _ from 'lodash';
import { IApplication, AppKeysArray, MutableObject } from '@src/types';
import { database } from '@src/database';
import { Logger } from '@src/utilities';

const {info} = new Logger();
const filterApplicationKeys: AppKeysArray = ['_id', '_key'];
const protectedApplicationKeys: AppKeysArray = ['cookie', 'cors', 'session', 'xPoweredByHeaders'];
const imageFields = ['logo', 'favicon'];

export const application: {configurationStore?: IApplication} = {};

export const get = function (field: keyof IApplication) {
    if (application.configurationStore && Object.hasOwnProperty.bind(application.configurationStore)(field)) {
        return application.configurationStore[field];
    }
}

export const getTypeofField = (field: keyof IApplication) => typeof get(field);

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

export const getCommonFields = function (): Array<keyof IApplication> {
    const {configurationStore} = application;
    const protectedFields = [...filterApplicationKeys, ...imageFields];
    if (!configurationStore) return [];

    const keys = Object.keys(configurationStore) as (keyof IApplication)[];
    return keys.filter((key: keyof IApplication) => typeof configurationStore[key] != 'object' && !protectedFields.includes(key));
}

export const set = function(key: keyof IApplication, value: any) {
    if (!key) {
        throw new Error('key is required');
    }

    Object.assign(application.configurationStore || {}, {[key]: value});
}

export const setValuesBulk = function(applicationObject: MutableObject) {
    const fieldsFromObj = Object.keys(applicationObject) as (keyof IApplication)[];
    const commonFields = getCommonFields();
    const invalid: (keyof IApplication)[] = [];

    fieldsFromObj.forEach(field => !commonFields.includes(field) && invalid.push(field));
    if (invalid.length) {
        throw new Error('Invalid store field(s) ' + invalid.join(', '));
    }
    fieldsFromObj.forEach(field => {
        const expectedType = getTypeofField(field)
        if (typeof applicationObject[field] != expectedType) {
            throw new Error(`Invalid type for ${field}. Expected ${expectedType} and found ${typeof applicationObject[field]}`);
        }
    });

    Object.assign(application.configurationStore || {}, applicationObject);
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