import { database } from "@src/database";
import { ICategory, IParamOptions, MutableObject } from "@src/types";
import { ValidSortingTechniques } from "@src/constants";
import { ValueError } from "@src/helpers";
import { application } from "@src/application";
import * as Utilities from "@src/utilities";
import categoryUtils from "./utils";
import locales from "@src/locales";

const MAX_CATEGORY_BLURB_LENGTH = 30;
export const categoryFields = [
    "cid",
    "userid",
    "name",
    "description",
    "blurb",
    "slug",
    "thumb",
    "altThumb",
    "tagsPerPost",
    "counters"
] as (keyof ICategory)[];

const getCategoriesWithData = async function getCategoriesWithData(perPage: number=15, page: number=1, fields: string[]=[], sorting: string='default') {
    // TODO need to properly write the logic with pagination and etc.
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
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

    const query: MutableObject = {_scheme: 'category:cid'};
    const pagination: Array<any> = [
        {
          $skip: (page - 1) * perPage,
        },
        {
          $limit: perPage,
        },
    ];

    if (sorting && sorting != 'undefined') {
        sorting = sorting.trim();
        
        if (!ValidSortingTechniques.hasOwnProperty(sorting.toUpperCase())) {
          throw new ValueError(locales.translate('api-errors:invalid_field', {field: 'sort type'}) + ' ' + sorting);
        }

        let sort = applySort(sorting);
        if (Object.keys(sort).length) {
            pagination.push(sort);
        }
    }

    const pipeline = createAggregationPipeline(query, pagination);
    var data = await database.aggregateObjects(pipeline);

    if (fields.includes('blurb')) {
        return data.map((category: any) => {
            if (Object.hasOwnProperty.bind(category)('description')) {
                category.blurb = category.blurb = categoryUtils.prepareBlurb(category);
            }
            
            return category;
        });
    }

    return data;
}

const getAllCategories = async function getAllCategories(perPage: number=15, page: number=1, fields?: (keyof ICategory)[], sorting: string | null='default', subCategories=true) {
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
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
    if (!sorting) {
        sorting = 'default';
    }

    let searchKeys = 'category:cid';
    let start = (page - 1) * perPage;
    let stop = start + perPage;

    if (!subCategories) {
        searchKeys = 'category:parent';
    }

    const [sets, total] = await Promise.all([
        database.fetchSortedSetsRange(searchKeys, start, stop),
        database.getObjectsCount(searchKeys),
    ]);
    let data: ICategory[] = [];
    if (sets && sets.length) {
        data = await database.getObjectsBulk(sets, fields) as ICategory[];
    }

    if (fields.includes('blurb')) {
        data = data.map((category: ICategory) => {
            category.blurb = category.blurb = categoryUtils.prepareBlurb(category);
            return category;
        });
    }
    
    return {categories: data, total: total ?? 0};
}

const getCategoryByCid = async function getCategoryByCid(id: any, fields: string[] = []) {
    if (!id) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'id'}));
    }

    if (isNaN(id)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'id', expected: 'number', got: typeof id}));
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'fields', expected: 'array', got: typeof fields}));
        
    } else if (!fields) {
        fields = []
    }

    const cid = Number(id);
    const category: ICategory = await database.getObjects('category:' + cid, fields);
    if (fields.includes('blurb')) {
        category.blurb = categoryUtils.prepareBlurb(category);
    }

    return category;   
}

const getCategoryByName = async function getCategoryByName(name: string, perPage: number=15, page: number=1, fields: string[]=[], sorting: string | null='default', subCategories=true) {
    if (!name) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'name'}));
    }
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
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
    if (!sorting) {
        sorting = 'default';
    }

    name = String(name).trim().toLowerCase();
    let key = 'category:name';
    let skip = (page - 1) * perPage;

    if (!subCategories) {
        key = 'category:name:child';
    }

    // let data: ICategory | ICategory[] = await database.getSortedSetsSearch({key: key, skip, limit: perPage, match: name}, fields); 
    let data: ICategory | ICategory[] = await searchKeysByTitle(key, name, skip, perPage, fields); 
    if (!Array.isArray(data)) {
        data = [data];
    }

    if (fields.includes('blurb')) {
        return data.map((category: ICategory) => {
            category.blurb = categoryUtils.prepareBlurb(category);
            return category;
        });
    }

    return data;
}

async function searchKeysByTitle(key: string, query: string, start: number, perPage: number, fields: string[]) {
    if (!query) {
        return [];
    }
    query = String(query).toLowerCase();
    const min = query;
    const max = query.substr(0, query.length - 1) + String.fromCharCode(query.charCodeAt(query.length - 1) + 1);

    const itemsPerPage = application.configurationStore?.maxItemsPerPage || 10;
    perPage = perPage || itemsPerPage * 10;

    const sets = await database.getSortedSetsLexical(key, min, max, start, perPage);
    const keys = sets.map((cidKey: string) => 'category:' + cidKey.split(':').pop());

    return database.getObjectsBulk(keys, fields);
}

function createAggregationPipeline (query: MutableObject, pagination: Array<MutableObject>) {
    if (!query) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'query'}));
    }
    if (typeof query !== 'object') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'query', expected: 'object', got: typeof query}));
    }

    const pipeline: Array<any> = [
        { $match: query },
        {
          $lookup: {
            from: "objects",
            let: { cid: "$cid" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$parent", "$$cid"] },
                  _scheme: 'category:cid',
                },
              },
            ],
            as: "subCategories",
          },
        },
        {
          $addFields: {
            subCategories: {
              $concatArrays: [
                {
                  $filter: {
                    input: "$subCategories",
                    cond: { $ne: ["$$this.parent", "$cid"] },
                  },
                },
                {
                  $map: {
                    input: {
                      $filter: {
                        input: "$subCategories",
                        cond: { $eq: ["$$this.parent", "$cid"] },
                      },
                    },
                    in: "$$this",
                  },
                },
              ],
            },
          },
        },
        {
          $match: {
            parent: { $exists: false },
          },
        },
    ];

    if (pagination && Array.isArray(pagination) && pagination.length) {
        pagination.forEach(e => pipeline.push(e))    
    }

    return pipeline;
}

function applySort (sortingType: string): MutableObject {
    if (!sortingType) return {};
    let query: MutableObject = {};

    switch(sortingType) {
        case 'recent':
            query = {
                $sort: {_id: -1}
            };
            break;

        case 'oldest':
            query = {
                $sort: {_id: 1}
            };
            break;

        case 'popular':
            query = {
                $sort: {'counters.posts': -1} // TODO: Figure out the logic
            };
            break;

        case 'posts':
            query = {
                $sort: {'counters.posts': -1}
            };
            break;

        default:
            break;
    }

    return query;
}

export default {
    categoryFields, getCategoryByName, getCategoriesWithData, getCategoryByCid,
    getAllCategories
} as const;