import { database } from "@src/database";
import { IParamOptions, IPost, ValidSortingTechniquesTypes } from "@src/types";
import { ValidSortingTechniques } from "@src/constants";
import { ValueError } from "@src/helpers";

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
    return await database.getObjects({ _key: 'post:' + postId}, fields);   
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
    const matchOptions = {
        skip: (page - 1) * perPage,
        limit: perPage,
        multi: true
    };

    return await database.getObjects(searchKeys, fields, matchOptions);  
}

export default {
    getPostById, getPosts, MAX_BLURB_SIZE
} as const;