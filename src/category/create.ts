import { ICategory } from "@src/types";
import utilities from './utils'
import { getISOTimestamp, generateAvatarFromInitials, sanitizeString } from "@src/utilities";
import _ from "lodash";
import { application } from "@src/application";
import { database } from "@src/database";
import data from "./data";

const MAX_BLURB_SIZE = 250;

export default async function create(categoryData: ICategory) {
    const {name='', userid, thumb} = categoryData;
    var {description='', blurb='', tagsPerPost, parent} = categoryData;
    var maxCategoryBlurbLength = application.configurationStore?.maxCategoryBlurbLength || MAX_BLURB_SIZE;

    if (!userid) {
        throw new Error('userid is required');
    }
    if (userid && typeof userid != 'number') {
        throw new TypeError(`userid must be a number, found ${typeof userid} instead`);
    }
    if (!name) {
        throw new Error('category name is required');
    }

    if (blurb) {
        if (blurb.length > maxCategoryBlurbLength) {
            throw new Error(`blurb cannot be more than ${maxCategoryBlurbLength} characters`);
        }
    } else {
        if (description) {
            blurb = description.substring(0, maxCategoryBlurbLength);
        } else blurb = '';
    }

    if (!tagsPerPost) {
        tagsPerPost = {
            min: 0,
            max: 0
        }
    } else {
        if (!Object.hasOwnProperty.bind(tagsPerPost)('min')) {
            if (!tagsPerPost.min) tagsPerPost.min = 0;
        };
        if (!Object.hasOwnProperty.bind(tagsPerPost)('max')) {
            if (!tagsPerPost.max) tagsPerPost.max = 0;
        }
    }

    if (parent) {
        if (typeof parent != 'number') {
            throw new TypeError('parent must be a number, found ' + typeof parent);
        }

        if (!await data.getCategoryByCid(parent)) {
            throw new Error('No such category exists with the parent id: ' + parent);
        }
    }

    const timestamp = getISOTimestamp();
    const now = Date.now();
    
    const category: ICategory = {};
    const slug = await utilities.generateCategoryslug(name);
    const cid = await utilities.generateNextCategoryId();
    const categorySlug = [cid, '/', slug].join('');
    const key = 'category:' + cid;

    category._key = key;
    category._scheme = 'category:cid';
    category.userid = userid;
    category.cid = cid;
    category.name = name;
    category.description = description || '';
    category.blurb = blurb;
    category.slug = categorySlug;
    category.thumb = thumb || generateAvatarFromInitials(category.name);
    category.tagsPerPost = tagsPerPost;
    category.posts = 0,
    category.tags = 0;

    if (parent){
        category.parent = Number(parent);
    }

    category.createdAt = timestamp;
    category.updatedAt = timestamp;

    const acknowledgement = await database.setObjects(key, category);
    const bulkAddSets = [
        ['category:cid', key, now],
        ['category:slug:' + sanitizeString(category.slug), key, now],
        ['category:userid:' + userid, key, now],
        ['category:name', String(sanitizeString(name)).toLowerCase() + ':' + cid, now],
    ];
    
    if (parent) {
        bulkAddSets.push(['category:child', key, now]);
        bulkAddSets.push(['category:' + parent + ':child', 'category:' + cid, now]);
        bulkAddSets.push(['category:name:child', String(sanitizeString(name)).toLowerCase() + ':' + cid, now]);
    } else {
        bulkAddSets.push(['category:parent', key, now]);
    }

    await database.sortedSetAddKeys(bulkAddSets);

    return acknowledgement;
}