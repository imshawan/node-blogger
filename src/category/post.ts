import _ from "lodash";
import { database } from "@src/database";
import { IUser, IPost, MutableObject } from "@src/types";
import { ValueError } from "@src/helpers";
import PostUtils from '@src/post/utils';
import PostData from '@src/post/data';
import * as User from '@src/user';

const userFields = [
    "userid",
    "username",
    "fullname",
    "picture",
    "slug",
] as (keyof IUser)[];

interface ICategoryPostOptions {
    perPage?: number; 
    page?: number; 
    fields?: (keyof IPost)[];
}

const getPosts = async function (categoryId: number, options: ICategoryPostOptions) {
    if (!categoryId) {
        throw new Error('categoryId is a required parameter');
    }
    if (!Number(categoryId)) {
        throw new ValueError('Invalid category id');
    }

    let {page, perPage, fields} = options ?? {};
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = PostData.validPostFields;
    }
    if (!fields.includes('userid')) {
        fields.push('userid');
    }

    let requiresContent = fields.includes('content');
    if (fields.includes('blurb') && !requiresContent) {
        fields.push('content');
    }
    if (!fields.includes('createdAt')) {
        fields.push('createdAt');
    }

    const searchKeys = 'category:' + categoryId + ':post',
        start = (page - 1) * perPage,
        stop = (perPage + start);

    const [postIds, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse(searchKeys, start, stop),
        database.getObjectsCount(searchKeys)
    ]);

    let data = await database.getObjectsBulk(postIds, fields);
    if (data.length) {
        data = await Promise.all(data.map( async (item: IPost) => {
            if (fields && fields.includes('blurb')) {
                item.blurb = PostUtils.preparePostBlurb(item);
            }
            if (fields && fields.includes('author')) {
                item.author = await User.getUserByUserId(item.userid, userFields);
            }

            return _.merge(item, PostUtils.serializePost(item));
        }));
    }

    return {posts: data, total: (total ?? 0) as number}
}

export default { getPosts } as const;