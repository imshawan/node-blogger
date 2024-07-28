import { database } from '@src/database';
import * as User from '@src/user';
import PostData from './data';
import _ from "lodash";
import { IUser } from '@src/types';
import locales from '@src/locales';

const validActions = ['like', 'unlike'];
const userFields = ['userid', 'username', 'fullname', 'picture', 'slug'] as (keyof IUser)[];

const like = async function (postId: number, caller: number) {
    return await handleLikes(postId, caller, 'like');
}

const unlike = async function (postId: number, caller: number) {
    return await handleLikes(postId, caller, 'unlike');
}

const get = async function (postId: number, page: number = 1, perPage: number = 10, fields?: (keyof IUser)[]) {
    if (isNaN(postId)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'postId', expected: 'number', got: typeof postId}));
    }
    if (postId < 1) {
        return {users: [], total: 0};
    }
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
    }
    if (isNaN(perPage) || isNaN(page)) {
        throw new TypeError(locales.translate('api-errors:invalid_types', {fields: 'perPage, page', expected: 'number'}));
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {field: 'fields', expected: 'array', got: typeof fields}));
    } else if (!fields || !fields.length) {
        fields = userFields;
    }

    const start = (page - 1) * perPage,
        stop = perPage + start,
        postKey = 'post:' + postId + ':like';

    const [userSets, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse(postKey, start, stop),
        database.getObjectsCount(postKey)
    ]);

    const userIds = userSets.map((key: string) => Number(String(key).split(':').pop()));
    const users = await User.getUsersById(userIds, userFields);

    return {users, total: (total ?? 0) as number};
}

const getCount = async function (postId: number): Promise<number> {
    if (isNaN(postId)) {
        throw new Error(locales.translate('api-errors:invalid_type', {field: 'postId', expected: 'number', got: typeof postId}));
    }
    if (postId < 1) {
        return 0;
    }

    const postKey = 'post:' + postId + ':like';
    const count = await database.getObjectsCount(postKey);

    return count as number;
}

export const hasLiked = async function (postId: number, caller: number) {
    if (isNaN(postId) || isNaN(caller)) {
        throw new Error(locales.translate('api-errors:invalid_types', {fields: 'postId, caller', expected: 'number'}));
    }
    if (postId < 1 || caller < 1) {
        return false;
    }

    const postKey = 'post:' + postId;
    const follow = await database.getSortedSetValue(postKey + ':like', 'user:' + caller);

    return Boolean(follow);
}

async function handleLikes(postId: number, caller: number, action: 'like' | 'unlike') {
    if (isNaN(postId) || isNaN(caller)) {
        throw new Error(locales.translate('api-errors:invalid_types', {fields: 'postId, caller', expected: 'number'}));
    }
    if (!validActions.includes(action)) {
        throw new Error(locales.translate('api-errors:invalid_field', {field: 'action'}) + ' ' + action);
    }

    postId = Number(postId);
    caller = Number(caller);

    const [post, callerExists] = await Promise.all([
        PostData.getPostById(postId),
        User.getUserByUserId(caller)
    ]);

    if (!post) {
        throw new Error(locales.translate('api-errors:entity_not_found', {entity: 'post'}));
    }
    if (!callerExists) {
        throw new Error(locales.translate('api-errors:entity_not_found', {entity: 'caller'}));
    }

    const alreadyLiked = await hasLiked(postId, caller),
        postKey = 'post:' + postId,
        callerKey = 'user:' + caller,
        now = Date.now(),
        promises: Promise<any>[] = [];

    if (action === 'like' && alreadyLiked) {
        return;
    }
    if (action === 'unlike' && !alreadyLiked) {
        return;
    }

    if (action === 'like') {
        promises.push(database.sortedSetAddKey(postKey + ':like', callerKey, now));
        promises.push(database.incrementFieldCount('likes', postKey));
    } else if (action === 'unlike') {
        promises.push(database.sortedSetRemoveKey(postKey + ':like', callerKey));
        promises.push(database.decrementFieldCount('likes', postKey));
    }

    const [, count] = await Promise.all(promises);

    return (!count || count < 1) ? 0 : count;
}

export default {
    like, unlike, hasLiked, get, getCount,
} as const;