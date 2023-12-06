import _ from 'lodash';
import { database } from "@src/database";
import { IEmailTemplate, MutableObject } from "@src/types";
import { getISOTimestamp, slugify, sanitizeHtml } from "@src/utilities";

export const create = async (data: IEmailTemplate) => {
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

    const timestamp = getISOTimestamp();
    const slug = slugify(name, false, '_');
    const id = await database.incrementFieldCount('emailTemplate');

    const templateData: IEmailTemplate = {};

    templateData._key = 'email:template';
    templateData.templateId = Number(id);
    templateData.name = name;
    templateData.slug = slug;
    templateData.html = sanitizeHtml(html);
    templateData.createdAt = timestamp;
    templateData.updatedAt = timestamp;

    const acknowledgement = await database.setObjects(templateData);
    return acknowledgement;
}

export const update = async function (data: IEmailTemplate, id: number) {
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

    const template = await database.getObjects({_key: 'email:template', templateId: Number(id)});
    if (!template) {
        throw new Error('No template was found with the corresponding template id');
    }

    if (Object.keys(templateData).length) {
        templateData.updatedAt = timestamp;
        await database.updateObjects({_key: 'email:template', templateId: Number(id)}, {$set: templateData});

    }
    return _.merge(template, templateData);
}

export const get = async function (perPage: number=15, page: number=1, fields: string[]=[]) {
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

    const query: MutableObject = {_key: 'email:template'};
    const matchOptions = {
        skip: (page - 1) * perPage,
        limit: perPage,
        multi: true
    };

    const templates = await database.getObjects(query, fields, matchOptions);
}

export const getById = async function (id: number, fields: string[]=[]) {
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

    const query = {_key: 'email:template', templateId: Number(id)};
    return await database.getObjects(query, fields);
}

export const getBySlug = async function (slug: string, fields: string[]=[]) {
    if (!slug) {
        throw new Error('slug is a required parameter');
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }

    const query = {_key: 'email:template', slug: String(slug).toLowerCase()};
    return await database.getObjects(query, fields);
}