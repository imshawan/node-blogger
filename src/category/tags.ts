import { database } from "@src/database";
import utilities from './utils'
import { getISOTimestamp } from "@src/utilities";
import _ from "lodash";
import { meta } from "@src/meta";
import { ICategoryTag, ICategory } from "@src/types";

const MAX_TAG_SIZE = 25;

const create = async function create(tagData: ICategoryTag) {
    const {name,cid,userid} = tagData;
    var maxTagLength = meta.configurationStore?.maxCategoryBlurbLength || MAX_TAG_SIZE;

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
        throw new Error('id must be a number, found ' + typeof cid)
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

const get = async function get(tagId: number) {}

const update = async function update(tagData: ICategoryTag) {}

const remove = async function remove(tagData: ICategoryTag) {}

export default {get, create, update, remove}