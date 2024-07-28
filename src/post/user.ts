import { database } from "@src/database";
import { IUser, IPost, MutableObject } from "@src/types";
import PostUtils from './utils';
import { getUsersById, getUserByUserId } from "@src/user";
import _ from "lodash";
import postUtils from './utils';
import locales from "@src/locales";

interface IUserPostOptions {
    perPage?: number; 
    page?: number; 
    fields?: string[];
}

const userFields = [
    "userid",
    "username",
    "fullname",
    "picture"
] as (keyof IUser)[];

const getUserPosts = async function (userid: number, options?: IUserPostOptions) {
    let {page, perPage, fields} = options ?? {};
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
    }
    if (!userid) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'userid'}));
    }
    if (isNaN(perPage)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'perPage', expected: 'number', got: typeof perPage}));
    }
    if (isNaN(page)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'page', expected: 'number', got: typeof page}));
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'fields', expected: 'array', got: typeof fields}));
    } else if (!fields) {
        fields = [];
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

    const searchKeys = 'post:userid:' + userid,
        start = (page - 1) * perPage,
        stop = (perPage + start);
    
    const [postIds, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse(searchKeys, start, stop),
        database.getObjectsCount(searchKeys)
    ]);
    
    let data = await database.getObjectsBulk(postIds, fields);
    if (data.length) {
        data = data.map((item: IPost) => {
            item.blurb = PostUtils.preparePostBlurb(item);
            if (!requiresContent) {
                item.content = undefined;
            }
            return item;
        });
    }

    if (fields.includes('author')) {
        const user = await getUserByUserId(Number(userid), userFields);
        
        data = data.map((post: IPost) => {
            post.author = user;
            return post;
        });
    }

    return {posts: data.map(postUtils.timeAgo), total: total ?? 0}
}

export default {getUserPosts} as const;