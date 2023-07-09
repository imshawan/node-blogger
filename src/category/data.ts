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

const getCategories = async function getCategories() {
    // TODO need to properly write the logic with pagination and etc.
    const data = await database.getObjects({_key: 'category'}, [], {multi: true});

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