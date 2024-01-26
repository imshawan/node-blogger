import { database } from "@src/database";
import utilities from './utils'
import { getISOTimestamp, slugify } from "@src/utilities";
import _ from "lodash";
import { application } from "@src/application";
import { ICategoryTag, ICategory } from "@src/types";
import { validAccessUserRoles, getUserRoles } from "@src/user";

const MAX_TAG_SIZE = 25;

const create = async function create(tagData: ICategoryTag) {
    const {name,cid,userid} = tagData;
    var maxTagLength = application.configurationStore?.maxCategoryBlurbLength || MAX_TAG_SIZE;

    if (!userid) {
        throw new Error('userid is required');
    }
    if (userid && typeof userid != 'number') {
        throw new TypeError(`userid must be a number, found ${typeof userid} instead`);
    }
    if (!name) {
        throw new Error('category name is required');
    }
    if (name.length > maxTagLength) {
        throw new Error(`tag name cannot be more than ${maxTagLength} characters`);
    }
    if (typeof cid != 'number') {
        throw new Error('cid must be a number, found ' + typeof cid)
    }

    const categorySearchKeys = {cid: Number(cid), _key: 'category'};
    const category: ICategory = await database.getObjects(categorySearchKeys);
    if (!category) {
        throw new Error('No such category was found with category id ' + cid);
    }

    const tag: ICategoryTag = {};

    const timestamp = getISOTimestamp();
    const tagId = await utilities.generateNextTagId();

    tag._key = `category:${cid}:tag:${tagId}`;
    tag._scheme = `category:cid:tag:tagId`;
    tag.cid = Number(cid);
    tag.tagId = tagId;
    tag.userid = Number(userid);
    tag.name = name;
    tag.posts = 0;
    tag.slug = [tagId, slugify(name)].join('/');
    tag.createdAt = timestamp;

    const [acknowledgement, ] = await Promise.all([
        database.setObjects(tag),
        onNewTag(tag),
    ]);
    return acknowledgement;
}

const getById = async function getById(tagId: number, cid: number, fields?: Array<string>) {
    if (!tagId) {
        throw new Error('A valid tag id is required')
    }
    if (!cid) {
        throw new Error('A valid category id is required')
    }
    if (_.isNaN(cid)) {
        throw new Error('cid must be a number, found ' + typeof cid)
    }
    if (typeof tagId != 'number') {
        throw new Error('tagId must be a number, found ' + typeof tagId)
    }
    if (!fields) {
        fields = [];
    }
    if (!Array.isArray(fields)) {
        fields = [];
    }
    const tagSearchKeys = {cid: Number(cid), _scheme: `category:cid:tag:tagId`, tagId: Number(tagId)};

    return await database.getObjects(tagSearchKeys, fields);
}

const exists = async function (tagId: number, cid: number) {
    return Boolean(await getById(tagId, cid));
}

const getByCategoryId = async function getByCategoryId(cid: number, fields?: Array<string>) {
    if (!cid) {
        throw new Error('A valid category id is required')
    }
    if (_.isNaN(cid)) {
        throw new Error('cid must be a number, found ' + typeof cid)
    }
    if (!fields) {
        fields = [];
    }
    if (!Array.isArray(fields)) {
        fields = [];
    }
    const tagSearchKeys = {cid: Number(cid), _key: `category:${cid}:tag`};

    return await database.getObjects(tagSearchKeys, ['name', 'tagId'], {multi: true});
}

const remove = async function remove(tagData: ICategoryTag, callerId: number) {
    const {cid, tagId} = tagData;

    if (!callerId) {
        throw new Error('callerId is required');
    }
    if (callerId && typeof callerId != 'number') {
        throw new TypeError(`callerId must be a number, found ${typeof callerId} instead`);
    }
    if (_.isNaN(cid)) {
        throw new Error('cid must be a number, found ' + typeof cid)
    }
    if (typeof tagId != 'number') {
        throw new Error('tagId must be a number, found ' + typeof tagId)
    }

    const categorySearchKeys = {cid: Number(cid), _key: 'category'};
    const tagSearchKeys = {cid: Number(cid), _key: `category:${cid}:tag`, tagId: Number(tagId)};

    const category: ICategory = await database.getObjects(categorySearchKeys);
    if (!category) {
        throw new Error('No such category was found with category id ' + cid);
    }

    const tag: ICategoryTag = await database.getObjects(tagSearchKeys);
    if (!tag) {
        throw new Error('No such tag was found with tag id ' + tagId);
    }

    let permissions = 0;
    const userRoles = await getUserRoles(callerId);

    validAccessUserRoles.forEach(role => {
        if (userRoles.includes(role)) {
            permissions++;
        }
    });

    if (!Boolean(permissions)) {
        throw new Error('callerId requires elevated permissions for performing this operation');
    }

    await Promise.all([
        database.deleteObjects(tagSearchKeys),
        onPurgeTag(tag),
    ]);
}

async function onNewTag(data: ICategoryTag) {
    const {cid} = data;

    await database.incrementFieldCount('tags', 'category:' + cid);
}

async function onPurgeTag(data: ICategoryTag) {
    const {cid} = data;

    await database.decrementFieldCount('tags', 'category:' + cid);
}

export default {getById, create, remove, getByCategoryId, exists}