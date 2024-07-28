import { database } from '@src/database';
import { sanitizeString, slugify } from '@src/utilities';
import { application } from '@src/application';
import { ICategory } from '@src/types';
import * as Utilities from "@src/utilities";
import locales from '@src/locales';

const MAX_CATEGORY_BLURB_LENGTH = 30;

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
        throw new TypeError(locales.translate('api-errors:invalid_types', {fields: 'postId, categoryId', expected: 'number'}));
    }

    const now = Date.now();
    const postKey = 'post:' + postId, 
        categoryKey = 'category:' + categoryId,
        bulkAddSets = [
            ['category:' + categoryId + ':post', postKey, now]
        ];

    await Promise.all([
        database.incrementFieldCount('posts', categoryKey),
        database.sortedSetAddKeys(bulkAddSets),
    ])
}

const onRemovePostWithCategory = async function onRemovePostWithCategory(postId: number, categoryId: number) {
    if (!postId || !categoryId || !Number(postId) || !Number(categoryId)) {
        throw new TypeError(locales.translate('api-errors:invalid_types', {fields: 'postId, categoryId', expected: 'number'}));
    }

    const postKey = 'post:' + postId, 
        categoryKey = 'category:' + categoryId,
        bulkRemoveSets = [
            ['category:' + categoryId + ':post', postKey]
        ];

    await Promise.all([
        database.decrementFieldCount('posts', categoryKey),
        database.sortedSetRemoveKeys(bulkRemoveSets),
    ])
}

const prepareBlurb = function (categoryData: ICategory) {
    const maxCategoryBlurbLength = application.configurationStore?.maxCategoryBlurbLength ?? MAX_CATEGORY_BLURB_LENGTH;
    let {description} = categoryData;

    if (!description || !description.length) {
        return ''
    }
    let clipped = Utilities.clipContent(description, maxCategoryBlurbLength);

    return clipped.split(' ').length < maxCategoryBlurbLength ? clipped : 
        (clipped.endsWith('.') ? clipped : (clipped + '...'));
}

export default {
    generateCategoryslug, generateNextCategoryId, generateNextTagId, onNewPostWithCategory, onRemovePostWithCategory, prepareBlurb
} as const