import { database } from '@src/database';
import { slugify } from '@src/utilities';
import { meta } from '@src/meta';
import { getCategoryBySlug } from './data';

export async function generateCategoryslug(name: string): Promise<string> {
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

export async function generateNextCategoryId() {
    return await database.incrementFieldCount('category');
}