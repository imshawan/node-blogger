import { database } from "@src/database";
import { MutableObject } from "@src/types";
import { ValidSortingTechniques } from "@src/constants";
import { ValueError } from "@src/helpers";

const categoryFields = [
    "cid",
    "userid",
    "name",
    "description",
    "blurb",
    "slug",
    "thumb",
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

    const query = {_key: 'category'};
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

    const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: "objects",
            let: { cid: "$cid" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$parent", "$$cid"] },
                  _key: "category",
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
        ...pagination
    ];

    var data = await database.aggregateObjects(pipeline);

    return data;
}

const getAllCategories = async function getAllCategories(perPage: number=15, page: number=1, fields: string[]=[]) {
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

  const searchKeys = {_key: 'category'};
  const matchOptions = {
    skip: (page - 1) * perPage,
    limit: perPage,
    multi: true
  };

  return await database.getObjects(searchKeys, fields, matchOptions);  
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
    return await database.getObjects({cid, _key: 'category'}, fields);   
}

const getCategoryByName = async function getCategoryByName(name: string, perPage: number=15, page: number=1, fields: string[]=[]) {
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
        throw new TypeError('perPage must be a number (int) found ' + typeof page);
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }

    name = String(name).trim();

    const searchKeys = {name: {$regex: new RegExp(name), $options: 'i'}, _key: 'category'};
    const matchOptions = {
      skip: (page - 1) * perPage,
      limit: perPage,
      multi: true
    };

    return await database.getObjects(searchKeys, fields, matchOptions);   
}

const getCategoryBySlug = async function getCategoryBySlug(slug: string) {
    if (!slug) {
        throw new Error('slug is required');
    }

    return await database.getObjects({slug, _key: 'category'});   
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