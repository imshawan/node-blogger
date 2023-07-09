import { ICategory } from "@src/types";
import utilities from './utils'
import { getISOTimestamp } from "@src/utilities";
import _ from "lodash";
import { meta } from "@src/meta";
import { database } from "@src/database";
import data from "./data";

const MAX_BLURB_SIZE = 250;

export default async function create(categoryData: ICategory) {
    const {name='', userid, thumb} = categoryData;
    var {description='', blurb='', tagsPerPost} = categoryData;
    var maxCategoryBlurbLength = meta.configurationStore?.maxCategoryBlurbLength || MAX_BLURB_SIZE;

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

    const timestamp = getISOTimestamp();
    
    const category: ICategory = {};
    const slug = await utilities.generateCategoryslug(name);
    const cid = await utilities.generateNextCategoryId();
    const categorySlug = [cid, '/', slug].join('');

    category._key = 'category';
    category.userid = userid;
    category.cid = cid;
    category.name = name;
    category.description = description || '';
    category.blurb = blurb;
    category.slug = categorySlug;
    category.thumb = thumb || '';
    category.counters = {
        posts: 0,
        tags: 0,
    };

    category.createdAt = timestamp;
    category.updatedAt = timestamp;

    const acknowledgement = await database.setObjects(category);
    return acknowledgement;
}