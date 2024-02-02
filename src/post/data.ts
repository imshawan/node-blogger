import { database } from "@src/database";
import { IParamOptions, IPost, MutableObject, ValidSortingTechniquesTypes } from "@src/types";
import { ValidSortingTechniques } from "@src/constants";
import { ValueError } from "@src/helpers";
import { application } from "@src/application";
import { clipContent, textFromHTML } from '@src/utilities';

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
    const post: IPost = await database.getObjects({ _key: 'post:' + postId}, fields);

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
        throw new TypeError('perPage must be a number (int) found ' + typeof page);
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }
    if (!sorting) {
        sorting = String(ValidSortingTechniques.DEFAULT) as ValidSortingTechniquesTypes;
    }

    const searchKeys = {_scheme: 'post:postId'};
    const matchOptions: MutableObject = {
        skip: (page - 1) * perPage,
        limit: perPage,
        multi: true,
        sort: applySort(sorting),
    };
    
    const [posts, total] = await Promise.all([
        database.getObjects(searchKeys, fields, matchOptions),
        database.getObjectsCount(searchKeys)
    ]);
    
    const data = posts.map((post: IPost) => {
        post.blurb = preparePostBlurb(post);
        return post;
    });

    return {posts: data, total: total ?? 0}
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

    switch(sortingType) {
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

export default {
    getPostById, getPosts, MAX_BLURB_SIZE
} as const;