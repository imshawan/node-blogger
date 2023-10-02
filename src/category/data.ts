import { database } from "@src/database";

const categoryFields = [
    "cid",
    "userid",
    "name",
    "description",
    "blurb",
    "slug",
    "thumb",
];

const getCategories = async function getCategories(perPage: number=15, page: number=1) {
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

    const query = {_key: 'category'};
    const pagination = [
      {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
    ];
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "objects",
          let: { cid: "$cid" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$parentCid", "$$cid"] },
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
                  cond: { $ne: ["$$this.parentCid", "$cid"] },
                },
              },
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$subCategories",
                      cond: { $eq: ["$$this.parentCid", "$cid"] },
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
          parentCid: { $exists: false },
        },
      },
      ...pagination
    ];

    var data = await database.aggregateObjects(pipeline);

    return data;
}

const getCategoryByCid = async function getCategoryByCid(id: any) {
    if (!id) {
        throw new Error('id is required');
    }

    if (isNaN(id)) {
        throw new Error('id must be a number, found ' + typeof id)
    }

    const cid = Number(id);
    return await database.getObjects({cid, _key: 'category'});   
}

const getCategoryByName = async function getCategoryByName(name: string) {
    if (!name) {
        throw new Error('name is required');
    }

    return await database.getObjects({name, _key: 'category'});   
}

const getCategoryBySlug = async function getCategoryBySlug(slug: string) {
    if (!slug) {
        throw new Error('slug is required');
    }

    return await database.getObjects({slug, _key: 'category'});   
}

export default {
    categoryFields, getCategoryByName, getCategoryBySlug, getCategories, getCategoryByCid
} as const;