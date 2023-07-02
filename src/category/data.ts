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
    categoryFields, getCategoryByName, getCategoryBySlug
} as const;