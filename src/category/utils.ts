import { database } from '@src/database';
import { slugify } from '@src/utilities';
import { meta } from '@src/meta';

const generateCategoryslug = async function generateCategoryslug(name: string): Promise<string> {
    let index = 0, generatedSlug='';

    while (!generatedSlug) {
        let slug = slugify(name);
        slug = index < 0 ? String(slug + '-' + index) : slug;

        const category = await database.getObjects({slug, _key: 'category'});
        if (category) {
            index++;
        } else {
            generatedSlug = slug;
            break;
        }
    }

    return generatedSlug;
}

const generateNextCategoryId = async function generateNextCategoryId(): Promise<number> {
    const id = await database.incrementFieldCount('category');
    return Number(id);
}

const generateNextTagId = async function generateNextTagId(): Promise<number> {
    const id = await database.incrementFieldCount('tag');
    return Number(id);
}

export default {
    generateCategoryslug, generateNextCategoryId, generateNextTagId
} as const