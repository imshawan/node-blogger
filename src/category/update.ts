import { ICategory } from "@src/types";
import utilities from './utils'
import { getISOTimestamp } from "@src/utilities";
import _ from "lodash";
import { meta } from "@src/meta";
import { database } from "@src/database";
import _data from "./data";


const MAX_BLURB_SIZE = 250;

export default async function update(data: ICategory) {
    const maxCategoryBlurbLength = meta.configurationStore?.maxCategoryBlurbLength || MAX_BLURB_SIZE;
    const {name, userid, thumb, description, cid, altThumb} = data;
    var {tagsPerPost, parent} = data;

    const categoryData: ICategory = {};
    const timestamp = getISOTimestamp();
    const searchKeys = {cid: Number(cid), _key: 'category'};

    if (!userid) {
        throw new Error('userid is required');
    }
    if (userid && typeof userid != 'number') {
        throw new TypeError(`userid must be a number, found ${typeof userid} instead`);
    }
    if (!cid) {
        throw new Error('id is required');
    }
    if (isNaN(cid)) {
        throw new Error('id must be a number, found ' + typeof cid)
    }

    const category: ICategory = await database.getObjects(searchKeys);
    if (!category) {
        throw new Error('No such category was found with category id ' + cid);
    }
    
    if (!name) {
        throw new Error('category name is required');
    }

    if (Object.hasOwnProperty.bind(data)('description')) {
        categoryData.description = description;

        if (description) {
            categoryData.blurb = description.substring(0, maxCategoryBlurbLength);
        } else {
            categoryData.blurb = '';
        }
    }

    if (tagsPerPost) {
        if (!Object.hasOwnProperty.bind(tagsPerPost)('min')) {
            if (!tagsPerPost.min) tagsPerPost.min = 0;
        };

        if (!Object.hasOwnProperty.bind(tagsPerPost)('max')) {
            if (!tagsPerPost.max) tagsPerPost.max = 0;
        }

        categoryData.tagsPerPost = tagsPerPost;
    }

    if (name && name != category.name) {
        const slug = await utilities.generateCategoryslug(name);
        categoryData.name = name;
        categoryData.slug = [cid, '/', slug].join('');
    }

    if (Object.hasOwnProperty.bind(data)('thumb')) {
        categoryData.thumb = thumb;
    }

    if (Object.hasOwnProperty.bind(data)('altThumb')) {
        categoryData.altThumb = altThumb;
    }

    if (parent) {
        if (typeof parent != 'number') {
            throw new TypeError('parent must be a number, found ' + typeof parent);
        }

        if (!await _data.getCategoryByCid(parent)) {
            throw new Error('No such category exists with the parent id: ' + parent);
        }

        categoryData.parent = Number(parent)
    }

    categoryData.updatedAt = timestamp;

    await database.updateObjects(searchKeys, {$set: categoryData});

    return _.merge(category, categoryData);
}