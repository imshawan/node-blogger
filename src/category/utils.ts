import { database } from '@src/database';
import { sanitizeString, slugify } from '@src/utilities';
import { application } from '@src/application';

const generateCategoryslug = async function generateCategoryslug(name: string): Promise<string> {
    let slug = slugify(name);

    const category = await database.getObjects('category:slug:' + sanitizeString(slug), [], {multi: true});

    if (category && category.length) {
        return String(slug + '-' + (category.length + 1));
    }

    return slug;
}

const generateNextCategoryId = async function generateNextCategoryId(): Promise<number> {
    const id = await database.incrementFieldCount('category');
    return Number(id);
}

const generateNextTagId = async function generateNextTagId(): Promise<number> {
    const id = await database.incrementFieldCount('tag');
    return Number(id);
}

const onNewPostWithCategory = async function onNewPostWithCategory(postId: number, categoryId: number) {
    if (!postId || !categoryId || !Number(postId) || !Number(categoryId)) {
        throw new Error('postId and categoryId are required parameters and must be numbers');
    }

    const postKey = 'post:' + postId;
}

export default {
    generateCategoryslug, generateNextCategoryId, generateNextTagId,onNewPostWithCategory
} as const