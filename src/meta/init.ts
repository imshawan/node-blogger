import _ from 'lodash';
import { IMeta, MetaKeysArray, MutableObject } from '@src/types';
import { database } from '@src/database';
import { Logger } from '@src/utilities';

const {info} = new Logger();
const filterMetaKeys: MetaKeysArray = ['_id', '_key'];
const protectedMetaKeys: MetaKeysArray = ['cookie', 'cors', 'session', 'xPoweredByHeaders'];

export const meta: {configurationStore?: IMeta} = {};

export const get = function (field: string) {
    if (meta.configurationStore && Object.hasOwnProperty.bind(meta.configurationStore)(field)) {
        // @ts-ignore
        return meta.configurationStore[field];
    }
}

export const getConfigurationStoreByScope = function (scope?: 'admin' | 'client') {
    const store: MutableObject = {};
    if (!scope) {
        scope = 'client';
    }
    if (meta.configurationStore) {
        const keys = Object.keys(meta.configurationStore) as (keyof IMeta)[];
        let filterKeys: MetaKeysArray = [];

        if (scope == 'admin') {
            filterKeys = filterMetaKeys;
        } else {
            filterKeys = protectedMetaKeys.concat(filterMetaKeys);
        }

        keys.forEach((key: keyof IMeta) => {
            if (!filterKeys.includes(key)) {
                store[key] = meta.configurationStore && meta.configurationStore[key];
            }
        });

    }

    return store;
}

export const set = function(key: keyof IMeta, value: any) {
    if (!key) {
        throw new Error('key is required');
    }

    Object.assign(meta.configurationStore || {}, {[key]: value});
}

export const initialize = async function initialize() {
    const _key = 'global:meta';
    const defaults =  require('../../setup/data/defaults.json');
    const metaExists = await database.getObjects({_key});
    if (!metaExists) {
        const metaInfo = _.merge({_key}, defaults);
        await database.setObjects(metaInfo);
        meta.configurationStore = metaInfo;
    } else {
        meta.configurationStore = metaExists;
    }

    info('Meta configuration store loaded');
}

export const reInitialize = async function reInitialize() {
    const _key = 'global:meta';
    const metaInfo = await database.getObjects({_key});
    meta.configurationStore = metaInfo;
}