import _ from 'lodash';
import nconf from "nconf";
import { database } from "@src/database";
import { IEmailTemplate, ISortedSetKey, MutableObject } from "@src/types";
import { getISOTimestamp, slugify, sanitizeHtml, sanitizeString, types } from "@src/utilities";
import { isAdministrator } from '@src/user';

const create = async (data: IEmailTemplate, caller: number) => {
    const {name, html} = data;
    if (!name && !name?.length) {
        throw new Error('Name is required.')
    }
    if (!html && !html?.length) {
        throw new Error('html content is required.')
    }
    if (typeof name !== 'string') {
        throw new Error('name must be a string, found ' + typeof name);
    }
    if (typeof html !== 'string') {
        throw new Error('html must be a string, found ' + typeof html);
    }
    if (!await isAdministrator(caller) && nconf.get('env') != 'test') {
        throw new Error('Caller must be an administrator for performing this operation.')
    }

    const timestamp = getISOTimestamp();
    const now = Date.now();
    const slug = slugify(name, false, '_');
    const id = await database.incrementFieldCount('emailTemplate');
    const canDelete = types.isBoolean(data.canDelete) ? types.parseBoolean(data.canDelete) : true;

    const templateData: IEmailTemplate = {};
    const key = 'email:template:' + id;

    templateData._key = key;
    templateData.templateId = Number(id);
    templateData.name = name;
    templateData.slug = slug;
    templateData.html = sanitizeHtml(html);
    templateData.canDelete = canDelete;
    templateData.createdAt = timestamp;
    templateData.updatedAt = timestamp;

    const bulkAddSets = [
        ['email:template:templateId', key, now],
        ['email:template:slug:' + sanitizeString(slug), key, now],
    ];

    const [acknowledgement, ] = await Promise.all([
        database.setObjects(key, templateData),
        database.sortedSetAddKeys(bulkAddSets)
    ]);

    return acknowledgement;
}

const update = async function (data: IEmailTemplate, id: number, caller: number) {
    const {name, html} = data;
    const timestamp = getISOTimestamp();
    const templateData: IEmailTemplate = {};
    
    if (name) {
        if (typeof name !== 'string') {
            throw new Error('name must be a string, found ' + typeof name);
        }
        templateData.name = name;
        templateData.slug = slugify(name, false, '_');
    }
    if (html) {
        if (typeof html !== 'string') {
            throw new Error('html must be a string, found ' + typeof html);
        }
        templateData.html = sanitizeHtml(html);
    }
    if (!await isAdministrator(caller) && nconf.get('env') != 'test') {
        throw new Error('Caller must be an administrator for performing this operation.')
    }

    const template = await database.getObjects('email:template:' + id);
    if (!template) {
        throw new Error('No template was found with the corresponding template id');
    }

    if (Object.keys(templateData).length) {
        templateData.updatedAt = timestamp;
        await database.updateObjects('email:template:' + id, templateData);

    }
    return _.merge(template, templateData);
}

const get = async function (perPage: number | null=15, page: number | null=1, fields: string[]=[]) {
    // TODO need to properly write the logic with pagination and etc.
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
    }
    if (isNaN(perPage)) {
        throw new TypeError('perPage must be a number (int) found ' + typeof perPage);
    }
    if (isNaN(page)) {
        throw new TypeError('perPage must be a number (int) found ' + typeof page);
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }

    const query = 'email:template:templateId';
    const matchOptions = {
        skip: (page - 1) * perPage,
        limit: perPage,
        multi: true
    };

    const [templateIds, total] = await Promise.all([
        database.fetchSortedSetsRange(query, matchOptions.skip, -1),
        database.getObjectsCount(query),
    ]);

    const data = await database.getObjectsBulk(templateIds, fields);

    return data;
}

const getById = async function (id: number, fields: string[]=[]): Promise<IEmailTemplate> {
    if (!id) {
        throw new Error('id is a required parameter');
    }
    if (isNaN(id)) {
        throw new TypeError('id must be a number (int) found ' + typeof id);
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }

    const query = 'email:template:' + id;
    return await database.getObjects(query, fields);
}

const getBySlug = async function (slug: string, fields: string[]=[]): Promise<IEmailTemplate | null> {
    if (!slug) {
        throw new Error('slug is a required parameter');
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }

    const key = 'email:template:slug:' + sanitizeString(slug);
    const set: ISortedSetKey = await database.getSortedSet(key);
    if (!set) {
        return null;
    }

    return database.getObjects(String(set.value), fields);
}

const removeById = async function (id: number, caller: number) {
    if (!id) {
        throw new Error('id is a required parameter');
    }
    if (isNaN(id)) {
        throw new TypeError('id must be a number (int) found ' + typeof id);
    }
    if (!await isAdministrator(caller) && nconf.get('env') != 'test') {
        throw new Error('Caller must be an administrator for performing this operation.')
    }

    const exists = await database.getObjects('email:template:' + id);
    if (!exists) {
        throw new Error('No template was found with the corresponding template id');
    }

    if (!exists.canDelete) {
        throw new Error('Template cannot be deleted.');
    }

    await database.deleteObjects('email:template:' + id);
}

export {
    create, get, getById, getBySlug, update, removeById
}