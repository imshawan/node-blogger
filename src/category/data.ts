import { database } from "@src/database";
import { ICategory, IParamOptions, MutableObject } from "@src/types";
import { ValidSortingTechniques } from "@src/constants";
import { ValueError } from "@src/helpers";
import { application } from "@src/application";
import * as Utilities from "@src/utilities";

const MAX_CATEGORY_BLURB_LENGTH = 30;
const categoryFields = [
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
];

const getCategoriesWithData = async function getCategoriesWithData(perPage: number=15, page: number=1, fields: string[]=[], sorting: string='default') {
    // TODO need to properly write the logic with pagination and etc.
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
          throw new ValueError('Invalid sorting type: ' + sorting);
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
                category.blurb = category.blurb = prepareBlurb(category);
            }
            
            return category;
        });
    }

    return data;
}

const getAllCategories = async function getAllCategories(perPage: number=15, page: number=1, fields: string[]=[], sorting: string | null='default', subCategories=true) {
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
        sorting = 'default';
    }

    const searchKeys: MutableObject = {_scheme: 'category:cid'};
    const matchOptions = {
        skip: (page - 1) * perPage,
        limit: perPage,
        multi: true
    };

    if (!subCategories) {
        searchKeys.parent = {$exists: false};
    }

    const data = await database.getObjects(searchKeys, fields, matchOptions);  

    if (fields.includes('blurb')) {
        return data.map((category: ICategory) => {
            category.blurb = category.blurb = prepareBlurb(category);
            return category;
        });
    }
    
    return data;
}

const getCategoryByCid = async function getCategoryByCid(id: any, fields: string[] = []) {
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

    const cid = Number(id);
    const category: ICategory = await database.getObjects({cid, _key: 'category:' + cid}, fields);
    if (fields.includes('blurb')) {
        category.blurb = prepareBlurb(category);
    }

    return category;   
}

const getCategoryByName = async function getCategoryByName(name: string, perPage: number=15, page: number=1, fields: string[]=[], sorting: string | null='default', subCategories=true) {
    if (!name) {
        throw new Error('name is required');
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
    if (!sorting) {
        sorting = 'default';
    }

    name = String(name).trim();

    const searchKeys: MutableObject = {name: {$regex: new RegExp(name), $options: 'i'}, _scheme: 'category:cid'};
    const matchOptions: IParamOptions = {
        skip: (page - 1) * perPage,
        limit: perPage,
        multi: true
    };

    if (!subCategories) {
        searchKeys.parent = {$exists: false};
    }

    if (sorting && sorting != 'undefined') {
        sorting = sorting.trim();
        
        if (!ValidSortingTechniques.hasOwnProperty(sorting.toUpperCase())) {
          throw new ValueError('Invalid sorting type: ' + sorting);
        }

        let sort = applySort(sorting);
        if (Object.keys(sort).length) {
            matchOptions.sort = sort['$sort']
        }
    }

    let data: ICategory | ICategory[] = await database.getObjects(searchKeys, fields, matchOptions);  
    if (!Array.isArray(data)) {
        data = [data]
    }

    if (fields.includes('blurb')) {
        return data.map((category: ICategory) => {
            category.blurb = prepareBlurb(category);
            return category
        });
    }

    return data;
}

const getCategoryBySlug = async function getCategoryBySlug(slug: string) {
    if (!slug) {
        throw new Error('slug is required');
    }

    return await database.getObjects({slug, _scheme: 'category:cid'});   
}

function prepareBlurb(categoryData: ICategory) {
    const maxCategoryBlurbLength = application.configurationStore?.maxCategoryBlurbLength ?? MAX_CATEGORY_BLURB_LENGTH;
    let {description} = categoryData;

    if (!description || !description.length) {
        return ''
    }
    let clipped = Utilities.clipContent(description, maxCategoryBlurbLength);

    return clipped.split(' ').length < maxCategoryBlurbLength ? clipped : 
        (clipped.endsWith('.') ? clipped : (clipped + '...'));
}

function createAggregationPipeline (query: MutableObject, pagination: Array<MutableObject>) {
    if (!query) {
        throw new ValueError('query is required for $match to function');
    }
    if (typeof query !== 'object') {
        throw new TypeError('query must be an object, found ' + typeof query);
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
    categoryFields, getCategoryByName, getCategoryBySlug, getCategoriesWithData, getCategoryByCid,
    getAllCategories
} as const;