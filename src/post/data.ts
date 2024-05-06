import { database } from "@src/database";
import { IParamOptions, IPost, ISortedSetKey, MutableObject, ValidSortingTechniquesTypes } from "@src/types";
import { ValidSortingTechniques } from "@src/constants";
import { ValueError } from "@src/helpers";
import { application } from "@src/application";
import { clipContent, textFromHTML } from '@src/utilities';
import _ from "lodash";
import PostUtils from './utils'

interface IPostOptions {
    perPage?: number; 
    page?: number; 
    fields?: string[]; sorting?: ValidSortingTechniquesTypes
}

const MAX_BLURB_SIZE = 35;

const getPostById = async function (id: number, fields: string[] = []): Promise<IPost> {
    if (!id) {
        throw new Error('id is required');
    }

    if (isNaN(id)) {
        throw new Error('id must be a number, found ' + typeof id)
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array but found ' + typeof fields);
        
    } else if (!fields) {
        fields = []
    }

    const postId = Number(id);
    const post: IPost = await database.getObjects('post:' + postId, fields);

    post.blurb = preparePostBlurb(post);

    return post;
}

const getPosts = async function (options?: IPostOptions) {
    let {page, perPage, fields, sorting} = options ?? {};
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
        throw new TypeError('page must be a number (int) found ' + typeof page);
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }
    if (!sorting) {
        sorting = String(ValidSortingTechniques.DEFAULT) as ValidSortingTechniquesTypes;
    }

    const searchKeys = 'post:postId';
    const matchOptions = {
        skip: (page - 1) * perPage,
        limit: perPage,
        multi: true,
    };
    
    const [postIds, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse(searchKeys, matchOptions.skip, (perPage + matchOptions.skip)),
        database.getObjectsCount(searchKeys)
    ]);
    
    let data = await database.getObjectsBulk(postIds, fields);
    if (data.length) {
        data = data.map((item: IPost) => {
            item.blurb = preparePostBlurb(item);
            return _.merge(item, PostUtils.serializePost(item));
        });
    }

    return {posts: data, total: total ?? 0}
}

const search = async function (title: string, perPage: number=15, page: number=1, fields: string[]=[]) {
    if (!title) {
        throw new Error('title is required');
    }
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
        throw new TypeError('page must be a number (int) found ' + typeof page);
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }

    let skip = (page - 1) * perPage,
        data = await searchKeysByTitle('post:title', title, skip, perPage, fields); 

    if (fields.includes('blurb')) {
        data.posts = data.posts.map((post: IPost) => {
            post.blurb = preparePostBlurb(post);
            return post;
        });
    }

    return data;
}

const getFeaturedPosts = async function (perPage: number=15, page: number=1, fields: string[]=[]) {
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
    }
    if (isNaN(perPage) || isNaN(page)) {
        throw new TypeError('perPage and page must be a number (int)');
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }

    let start = (page - 1) * perPage, stop = (start + perPage);

    const [postIds, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse('post:featured', start, stop),
        database.getObjectsCount('post:featured')
    ]);

    let data = await database.getObjectsBulk(postIds.map(e => 'post:' + e), fields);
    if (data.length) {
        data = data.map((item: IPost) => {
            item.blurb = preparePostBlurb(item);
            return item;
        });
    }

    return {posts: data, total: total ?? 0};
}

const getPostsByTag = async function (tagId: number, perPage: number=15, page: number=1, fields: (keyof IPost)[]=[]) {
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
    }
    if (isNaN(perPage) || isNaN(page)) {
        throw new TypeError('perPage and page must be a number (int)');
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }

    const key = 'tag:' + tagId + ':post',
        start = (page - 1) * perPage, stop = (start + perPage);


    const [postIds, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse(key, start, stop),
        database.getObjectsCount(key)
    ]);

    let data = await database.getObjectsBulk(postIds) ?? [];

    if (fields.length) {
        data = data.map((item: IPost) => {
            let obj: MutableObject = {};

            fields.forEach(field => {
                if (Object.hasOwnProperty.bind(item)(field)) {
                    obj[field] = item[field];
                } else {
                    obj[field] = null;
                }
            });

            if (fields.includes('blurb'))  {
                obj.blurb = preparePostBlurb(item);
            }

            return obj;
        });
    } else {
        data = data.map((item: IPost) => _.merge(item, {blurb: preparePostBlurb(item)}));
    }

    return {posts: data, total: total ?? 0};
}

function preparePostBlurb(postData: IPost): string {
    let {content} = postData;
    let maxPostBlurbSize = application.configurationStore?.maxPostBlurbSize || MAX_BLURB_SIZE;

    if (!content) return '';
    
    content = textFromHTML(content ?? '');
    let clipped = clipContent(content, maxPostBlurbSize);

    return clipped.split(' ').length < maxPostBlurbSize ? clipped : (clipped.endsWith('.') ? clipped : (clipped + '...'));
}

function applySort (sortingType: string): MutableObject {
    if (!sortingType) return {};
    let query: MutableObject = {};

    switch(String(sortingType).toLowerCase()) {
        case 'recent':
            query = {_id: -1};
            break;

        case 'oldest':
            query = {_id: 1};
            break;

        case 'popular':
            query = {views: -1, likes: -1, comments: -1};
            break;

        default:
            break;
    }

    return query;
}

async function searchKeysByTitle(key: string, query: string, start: number, perPage: number, fields: string[]) {
    query = String(query).trim().toLowerCase();

    const itemsPerPage = application.configurationStore?.maxItemsPerPage || 10;
    perPage = perPage || itemsPerPage * 10;

    const [sets, total] = await Promise.all([
        database.getSortedSetsSearch({key, match: query, skip: start, limit: perPage}),
        database.getSortedSetsSearchCount(key, query),
    ]);

    const keys = sets.map((postKey: string) => 'post:' + postKey.split(':').pop());
    const posts = await database.getObjectsBulk(keys, fields) as IPost[];

    return {posts, total: total ?? 0};
}

export default {
    getPostById, getPosts, getFeaturedPosts, search, getPostsByTag, MAX_BLURB_SIZE
} as const;