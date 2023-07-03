import _ from 'lodash';
import { IMeta } from '@src/types';
import { database } from '@src/database';
import { Logger } from '@src/utilities';

const {info} = new Logger();
export const meta: {configurationStore?: IMeta} = {};

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