import { application } from "@src/application";
import { IPost, Status } from "@src/types";
import { database } from "@src/database";
import { getISOTimestamp, calculateReadTime, textFromHTML, sanitizeString } from "@src/utilities";
import utilities from './utils';
import Category from '@src/category';
import locales from "@src/locales";

const MIN_POST_SIZE = 20;
const MAX_POST_SIZE = 2550;
const MIN_POST_TITLE_LENGTH = 2;
const MAX_POST_TITLE_LENGTH = 250;

export const create = async function create(data: IPost): Promise<IPost> {
    const {title='', userid, content, featuredImage, wordCount} = data;
    let {tags, categories, status} = data;

    const minPostLength = application.configurationStore?.minPostLength || MIN_POST_SIZE;
    const maxPostLength = application.configurationStore?.maxPostLength || MAX_POST_SIZE;
    const minPostTitleLength = application.configurationStore?.minPostTitleLength || MIN_POST_TITLE_LENGTH;
    const maxPostTitleLength = application.configurationStore?.maxPostTitleLength || MAX_POST_TITLE_LENGTH;

    if (!status) {
        status = 'draft';
    }

    if (!userid) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'userid'}));
    }
    if (userid && typeof userid != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'userid', expected: 'number', got: typeof userid}));
    }
    if (!title) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'title'}));
    }
    if (title.length < minPostTitleLength) {
        throw new Error(locales.translate('api-errors:chars_too_short', {field: 'title', size: minPostTitleLength}));
    }
    if (title.length > maxPostTitleLength) {
        throw new Error(locales.translate('api-errors:chars_too_long', {field: 'title', size: maxPostTitleLength}));
    }
    if (!content) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'content'}));
    }
    
    const contentSizeInWords = String(textFromHTML(content)).split(' ').length;
    if (contentSizeInWords < minPostLength) {
        throw new Error(locales.translate('api-errors:chars_too_short', {field: 'Post', size: minPostLength}));
    }
    if (contentSizeInWords > maxPostLength) {
        throw new Error(locales.translate('api-errors:chars_too_long', {field: 'Post', size: maxPostLength}));
    }
    if (!utilities.isValidStatus(status)) {
        throw new Error(locales.translate('api-errors:invalid_field', {field: 'status'}) + ' ' + status);
    }

    if (!categories || !Array.isArray(categories) || !categories.length) {
        categories = [];
    }
    if (!tags || !Array.isArray(tags) || !tags.length) {
        tags = [];
    }

    let tagKeyErrors = 0, categoryKeyErrors = 0;

    tags.forEach(tag => !isValidTagKey(tag) && tagKeyErrors++);
    categories.forEach(category => !isValidCategoryKey(category) && categoryKeyErrors++);

    if (tagKeyErrors) {
        throw new Error(locales.translate('api-errors:n_invalid_entity_found', {n: tagKeyErrors, entity: 'tag'}));
    }
    if (categoryKeyErrors) {
        throw new Error(locales.translate('api-errors:n_invalid_entity_found', {n: categoryKeyErrors, entity: 'category'}));
    }

    const postData:IPost = { _scheme: 'post:postId'};

    const [postId, slug] = await Promise.all([
        utilities.generateNextPostId(),
        utilities.generatePostslug(title),
    ])

    const timestamp = getISOTimestamp();
    const now = Date.now();
    const suffix = 'minute';
    const readTime = calculateReadTime(content, suffix);
    const key = 'post:' + postId;
    const tagIds = tags.map((tag: string) => Number(String(tag).split(':').pop()));
    const textContent = textFromHTML(content ?? '');

    status = String(status).toLowerCase().trim() as Status;

    postData._key = key;
    postData.postId = postId
    postData.userid = userid;
    postData.title = title;
    postData.content = content;
    postData.slug = [postId, '/', slug].join('');
    postData.categories = categories; // WIll be an array of keys ['category:cid']
    postData.tags = tags; // WIll be an array of keys ['tag:tagId']
    postData.views = 0;
    postData.likes = 0;
    postData.comments = 0;
    postData.status = status;
    postData.featuredImage = featuredImage;
    postData.wordCount = wordCount || String(textContent).length;
    postData.readTime = `${readTime} ${suffix}${readTime > 1 ? 's' : ''}`;

    postData.createdAt = timestamp;
    postData.updatedAt = timestamp;

    const bulkAddSets = [
        ['post:postId', key, now],
        ['post:slug:' + sanitizeString(slug), key, now],
        ['post:userid:' + userid, key, now],
        ['post:title', String(sanitizeString(title)).toLowerCase() + ':' + postId, now],
        ['post:featured', postId, 0],
    ];

    const [acknowledgement, ,] = await Promise.all([
        database.setObjects(key, postData),
        database.sortedSetAddKeys(bulkAddSets),
        onNewPost(postData),
    ]);

    await Category.tags.onNewPostWithTags(postId, tagIds);

    return acknowledgement;
}

async function onNewPost(data:IPost) {
    const {tags, categories, userid, postId} = data;

    const promises: Promise<any>[] = [
        database.incrementFieldCount('posts', 'user:' + userid + ':metrics'),
    ];

    if (categories && Array.isArray(categories) && categories.length) {
        categories.forEach(key => {
            promises.push(database.incrementFieldCountByKeyAndValue('rank', 'user:' + userid + ':category:post', key));
            promises.push(Category.utilities.onNewPostWithCategory(Number(postId), Number(String(key).split(':').pop())))
        });
    }
    if (tags && Array.isArray(tags) && tags.length) {
        tags.forEach(key => {
            promises.push(database.incrementFieldCount('posts', key));
        });
    }

    await Promise.all(promises);
}

function isValidTagKey(key: string) {
    const pattern = /^tag:\d+$/;
    return pattern.test(key);
}

function isValidCategoryKey(key: string) {
    const pattern = /^category:\d+$/;
    return pattern.test(key);
}