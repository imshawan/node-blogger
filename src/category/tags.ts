import { database } from "@src/database";
import utilities from './utils'
import { getISOTimestamp, slugify, sanitizeString } from "@src/utilities";
import _ from "lodash";
import { application } from "@src/application";
import { ICategoryTag, ICategory } from "@src/types";
import { validAccessUserRoles, getUserRoles } from "@src/user";
import Tags from './tags';
import { CATEGORY_TAG_WEIGHTS } from '@src/constants';
import locales from "@src/locales";

const MAX_TAG_SIZE = 25;

const create = async function create(tagData: ICategoryTag): Promise<ICategoryTag> {
    const {name,cid,userid} = tagData;
    var maxTagLength = application.configurationStore?.maxCategoryBlurbLength || MAX_TAG_SIZE;

    if (!userid) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'userid'}));
    }
    if (userid && typeof userid != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'userid', expected: 'number', got: typeof userid}));
    }
    if (!name) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'name'}));
    }
    if (name.length > maxTagLength) {
        throw new Error(locales.translate('api-errors:chars_too_long', {field: 'name', size: maxTagLength}));
    }
    if (typeof cid != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'cid', expected: 'number', got: typeof cid}));
    }

    const categorySearchKeys = 'category:' + cid;
    const category: ICategory = await database.getObjects(categorySearchKeys);
    if (!category) {
        throw new Error(locales.translate('api-errors:entity_not_found', {entity: 'category'}));
    }

    const tag: ICategoryTag = {};

    const timestamp = getISOTimestamp();
    const now = Date.now();
    const tagId = await utilities.generateNextTagId();
    const key = `tag:${tagId}`;

    tag._key = key;
    tag._scheme = `tag:tagId`;
    tag.cid = Number(cid);
    tag.tagId = tagId;
    tag.userid = Number(userid);
    tag.name = name;
    tag.posts = 0;
    tag.slug = [tagId, slugify(name)].join('/');
    tag.createdAt = timestamp;

    const bulkAddSets = [
        ['category:' + cid + ':tag', key, now],
        ['category:' + cid + ':tag:name', String(sanitizeString(name)).toLowerCase() + ':' + key, now],
        ['tag:popular', tagId, 0],
    ];

    const [acknowledgement, ] = await Promise.all([
        database.setObjects(key, tag),
        database.sortedSetAddKeys(bulkAddSets),
        onNewTag(tag),
    ]);
    return acknowledgement as ICategoryTag;
}

const getById = async function getById(tagId: number, fields?: Array<string>) {
    if (!tagId) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'tagId'}));
    }
    if (typeof tagId != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'tagId', expected: 'number', got: typeof tagId}));
    }
    if (!fields) {
        fields = [];
    }
    if (!Array.isArray(fields)) {
        fields = [];
    }
    const tagSearchKeys = `tag:${tagId}`;

    const tag = await database.getObjects(tagSearchKeys, fields);
    return tag as ICategoryTag;
}

const getByKeys = async function getByIds(keys: Array<string>, fields?: Array<string>) {
    if (!keys || !Array.isArray(keys) || !keys.length) {
        return [];
    }

    let tagKeyErrors = 0;
    keys.forEach(key => !isValidTagKey(key) && tagKeyErrors++);

    if (tagKeyErrors) {
        throw new Error(locales.translate('api-errors:invalid_entity_fields', {entity: 'tag', fields: tagKeyErrors}));
    }
    if (!fields) {
        fields = [];
    }
    if (!Array.isArray(fields)) {
        fields = [];
    }

    const tags = await database.getObjectsBulk(keys, fields);
    return tags as Array<ICategoryTag>;
}

const exists = async function (tagId: number) {
    return Boolean(await getById(tagId));
}

const getByCategoryId = async function getByCategoryId(cid: number, fields?: (keyof ICategoryTag)[]) {
    if (!cid) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'cid'}));
    }
    if (_.isNaN(cid)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'cid', expected: 'number', got: typeof cid}));
    }
    if (!fields) {
        fields = [];
    }
    if (!Array.isArray(fields)) {
        fields = [];
    }
    const tagSearchKeys = `category:${cid}:tag`;

    const sets = await database.fetchSortedSetsRange(tagSearchKeys, 0, -1);
    const tags = await database.getObjectsBulk(sets, fields);

    return tags as ICategory[];
}

const getByCategoryIdAndName = async function getByCategoryIdAndName(cid: number, name: string, fields?: Array<string>) {
    if (!cid) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'cid'}));
    }
    if (_.isNaN(cid)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'cid', expected: 'number', got: typeof cid}));
    }
    if (!fields || !Array.isArray(fields) || !fields.length) {
        fields = ['name', 'tagId', 'cid'];
    }

    const tagSearchKeys = `category:${cid}:tag:name`;

    name = String(name).toLowerCase();
    let min = name;
    let max = name.substr(0, name.length - 1) + String.fromCharCode(name.charCodeAt(name.length - 1) + 1);

    let sets = await database.getSortedSetsLexical(tagSearchKeys, min, max, 0, -1);
    if (!sets || !sets.length) {
        return [];
    }

    let tagIds = sets.map((set: string) => 'tag:' + set.split(':').pop());
    return database.getObjectsBulk(tagIds, fields);
}

const getPopularTags = async function (perPage: number=15, page: number=1, fields: string[]=[]) {
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
    }
    if (isNaN(perPage) || isNaN(page)) {
        throw new TypeError(locales.translate('api-errors:invalid_types', {fields: 'page, perPage', expected: 'number'}));
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'fields', expected: 'array', got: typeof fields}));
    } else if (!fields) {
        fields = [];
    }

    let start = (page - 1) * perPage, stop = (start + perPage);

    const [tagIds, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse('tag:popular', start, stop),
        database.getObjectsCount('tag:popular')
    ]);

    let data = await database.getObjectsBulk(tagIds.map(id => 'tag:' + id), fields);

    return {tags: data, total: total ?? 0};
}

const remove = async function remove(tagData: ICategoryTag, callerId: number) {
    const {cid, tagId} = tagData;

    if (!callerId) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'callerId'}));
    }
    if (callerId && typeof callerId != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'callerId', expected: 'number', got: typeof callerId}));
    }
    if (typeof tagId != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'tagId', expected: 'number', got: typeof tagId}));
    }

    const categorySearchKey = 'category:' + cid;
    const tagSearchKey = `tag:${tagId}`;

    const category: ICategory = await database.getObjects(categorySearchKey);
    if (!category) {
        throw new Error(locales.translate('api-errors:entity_not_found', {entity: 'category'}));
    }

    const tag: ICategoryTag = await database.getObjects(tagSearchKey);
    if (!tag) {
        throw new Error(locales.translate('api-errors:entity_not_found', {entity: 'tag'}));
    }

    let permissions = 0;
    const userRoles = await getUserRoles(callerId);

    validAccessUserRoles.forEach(role => {
        if (userRoles.includes(role)) {
            permissions++;
        }
    });

    if (!Boolean(permissions)) {
        throw new Error(locales.translate('api-errors:entity_requires_admin_privilege', {entity: 'caller'}));
    }

    const bulkRemoveSets = [
        ['category:' + cid + ':tag', tagSearchKey],
        ['category:' + cid + ':tag:name', String(sanitizeString(tag.name ?? '')).toLowerCase() + ':' + tagSearchKey],
        ['tag:popular', tagId]
    ]

    await Promise.all([
        database.deleteObjects(tagSearchKey),
        database.sortedSetRemoveKeys(bulkRemoveSets),
        onPurgeTag(tag),
    ]);
}

const onNewPostWithTags = async function onNewPostWithTag(postId: number, tagIds: Array<number>) {
    if (!postId || !Number(postId)) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'postId'}));
    }

    const promises: Promise<any>[] = [], 
        postkey = 'post:' + postId,
        bulkAddSets: (string | number)[][] = [],
        now = Date.now();

    if (!tagIds || !Array.isArray(tagIds) || !tagIds.length) return;
    
    tagIds.forEach((tagId: number) => {
        bulkAddSets.push(['tag:' + tagId + ':post', postkey, now]);
        return promises.push(reCalculateTagPopularity(tagId));
    });

    promises.push(database.sortedSetAddKeys(bulkAddSets));

    await Promise.all(promises);
}

const onTagRemove = async function onTagRemove(postId: number, tagId: number) {
    if (!postId || !Number(postId)) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'postId'}));
    }
    if (!tagId) return;

    const tagKey = 'tag:' + tagId,
        postkey = 'post:' + postId;

    await Promise.all([
        database.decrementFieldCount('posts', tagKey),
        database.sortedSetRemoveKey('tag:' + tagId + ':post', postkey),
        reCalculateTagPopularity(tagId),
    ])
}

async function onNewTag(data: ICategoryTag) {
    const {cid} = data;

    await database.incrementFieldCount('tags', 'category:' + cid);
}

async function onPurgeTag(data: ICategoryTag) {
    const {cid} = data;

    await database.decrementFieldCount('tags', 'category:' + cid);
}

async function reCalculateTagPopularity(tagId: number) {
    let tag = await Tags.getById(tagId), 
        tagUpdationTime = tag.updatedAt ? new Date(tag.updatedAt).getTime() : 0,
        rank = (CATEGORY_TAG_WEIGHTS.posts * (tag.posts ?? 0)) +
                (CATEGORY_TAG_WEIGHTS.freshness * (Date.now() - tagUpdationTime));

    await database.updateSortedSetValue('tag:popular', tagId, {rank: Math.floor(rank)});
}

function isValidTagKey(key: string) {
    const pattern = /^tag:\d+$/;
    return pattern.test(key);
}

export default {
	getById,
    getByKeys,
	create,
	remove,
	getByCategoryId,
	exists,
	getByCategoryIdAndName,
    getPopularTags,
	onNewPostWithTags,
	onTagRemove,
} as const