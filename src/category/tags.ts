import { database } from "@src/database";
import utilities from './utils'
import { getISOTimestamp } from "@src/utilities";
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

    tag._key = `category:${cid}:tag`;
    tag.cid = Number(cid);
    tag.tagid = tagId;
    tag.userid = Number(userid);
    tag.name = name;
    tag.createdAt = timestamp;

    const acknowledgement = await database.setObjects(tag);
    return acknowledgement;
}

const getById = async function get(tagId: number, cid: number, fields?: Array<string>) {
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
        throw new Error('tagid must be a number, found ' + typeof tagId)
    }
    if (!fields) {
        fields = [];
    }
    if (!Array.isArray(fields)) {
        fields = [];
    }
    const tagSearchKeys = {cid: Number(cid), _key: `category:${cid}:tag`, tagid: Number(tagId)};

    return await database.getObjects(tagSearchKeys, fields);
}

const getByCategoryId = async function get(cid: number, fields?: Array<string>) {
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

    return await database.getObjects(tagSearchKeys, ['name', 'tagid'], {multi: true});
}

const remove = async function remove(tagData: ICategoryTag, callerId: number) {
    const {cid, tagid} = tagData;

    if (!callerId) {
        throw new Error('callerId is required');
    }
    if (callerId && typeof callerId != 'number') {
        throw new TypeError(`callerId must be a number, found ${typeof callerId} instead`);
    }
    if (_.isNaN(cid)) {
        throw new Error('cid must be a number, found ' + typeof cid)
    }
    if (typeof tagid != 'number') {
        throw new Error('tagid must be a number, found ' + typeof tagid)
    }

    const categorySearchKeys = {cid: Number(cid), _key: 'category'};
    const tagSearchKeys = {cid: Number(cid), _key: `category:${cid}:tag`, tagid: Number(tagid)};

    const category: ICategory = await database.getObjects(categorySearchKeys);
    if (!category) {
        throw new Error('No such category was found with category id ' + cid);
    }

    const tag: ICategoryTag = await database.getObjects(tagSearchKeys);
    if (!tag) {
        throw new Error('No such tag was found with tag id ' + tagid);
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

    await database.deleteObjects(tagSearchKeys);
}

export default {getById, create, remove, getByCategoryId}