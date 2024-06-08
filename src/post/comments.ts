import _ from "lodash";
import { database } from "@src/database";
import * as Utilities from "@src/utilities";
import { application } from "@src/application";
import { IComment, IPost, IUser } from "@src/types";
import * as User from "@src/user";
import locales from "@src/locales";
import PostUtils from "./utils";

const MIN_CONTENT_SIZE = 5,
    MAX_CONTENT_SIZE = 255;

const userFields = ['username', 'fullname', 'slug', 'picture'] as (keyof IUser)[];


const getById = async function get(id: number, fields?: (keyof IComment)[]) {
    if (!id) {
        throw new Error(locales.translate('api-errors:is_required', { field: 'id' }));
    }
    if (typeof id != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {
            field: 'id',
            expected: 'number',
            got: typeof id,
        }));
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {
            field: 'fields',
            expected: 'array',
            got: typeof fields,
        }));
    } else if (!fields) {
        fields = [];
    }
    const populateAuthors = fields.length && fields.includes('author');
    if (populateAuthors) {
        fields.push('userid');
    }

    const key = `comment:${id}`;
    const comment = await database.getObjects(key, fields) as IComment;

    if (populateAuthors) {
        comment.author = await User.getUserByUserId(comment.userid, userFields);
    }

    return comment;
}

const getWithPostId = async function get(postId: number, perPage: number = 15, page: number = 1, fields?: (keyof IComment)[]) {
    if (!postId) {
        throw new Error(locales.translate('api-errors:is_required', { field: 'postId' }));
    }
    if (typeof postId != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {
            field: 'postId',
            expected: 'number',
            got: typeof postId,
        }));
    }
    if (!perPage || isNaN(perPage)) {
        perPage = 15;
    }
    if (!page || isNaN(page)) {
        page = 1;
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {
            field: 'fields',
            expected: 'array',
            got: typeof fields,
        }));
    } else if (!fields) {
        fields = [];
    }

    const key = 'post:' + postId + ':comment:parent';
    const start = (page - 1) * perPage;
    const stop = start + perPage;
    const populateAuthors = fields.length && fields.includes('author');

    const [sets, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse(key, start, stop),
        database.getObjectsCount(key)
    ]);

    if (populateAuthors) {
        fields.push('userid');
    }

    let data: IComment[] = [];
    if (sets && sets.length) {
        data = await database.getObjectsBulk(sets, fields) as IComment[];
    }

    if (populateAuthors) {
        data = await populateCommentAuthors(data);
    }

    let replies = await database.getObjectsCounts(data.map(cmnt => 'comment:' + cmnt.commentId + ':reply'));
    data = data.map((item) => {
        let key = 'comment:' + item.commentId + ':reply';
        if (replies[key]) {
            item.replies = replies[key];
        }

        return item;
    });

    return { comments: data, total: total ?? 0 };
}

const getReplies = async function getReplies(commentId: number, perPage: number = 15, page: number = 1, fields?: (keyof IComment)[]) {
    if (!commentId) {
        throw new Error(locales.translate('api-errors:is_required', { field: 'commentId' }));
    }
    if (typeof commentId != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {
            field: 'commentId',
            expected: 'number',
            got: typeof commentId,
        }));
    }
    if (!perPage || isNaN(perPage)) {
        perPage = 15;
    }
    if (!page || isNaN(page)) {
        page = 1;
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {
            field: 'fields',
            expected: 'array',
            got: typeof fields,
        }));
    } else if (!fields) {
        fields = [];
    }

    const populateAuthors = fields.length && fields.includes('author');
    if (populateAuthors) {
        fields.push('userid');
    }

    const repliesKey = 'comment:' + commentId + ':reply';
    const start = (page - 1) * perPage;
    const stop = start + perPage;

    const [sets, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse(repliesKey, start, stop),
        database.getObjectsCount(repliesKey)
    ]);

    if (!sets.length) {
        return { comments: [] as IComment[], total: 0 };
    }

    let replies = await database.getObjectsBulk(sets, fields) as IComment[];
    if (populateAuthors) {
        replies = await populateCommentAuthors(replies);
    }

    return { comments: replies, total: total ?? 0 };
}

const create = async function create(commentData: IComment): Promise<IComment> {
    const { content, userid, postId, parent } = commentData;
    var maxCommentSize = application.configurationStore?.maxCommentSize || MAX_CONTENT_SIZE,
        minCommentSize = application.configurationStore?.minCommentSize || MIN_CONTENT_SIZE;

    if (!userid) {
        throw new Error(locales.translate('api-errors:userid_requierd'));
    }
    if (userid && typeof userid != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {
            field: 'userid',
            expected: 'number',
            got: typeof userid,
        }));
    }
    if (!content) {
        throw new Error(locales.translate('api-errors:is_required', { field: 'content' }));
    }
    if (content.length < minCommentSize) {
        throw new Error(locales.translate('api-errors:chars_too_short', { field: 'content', size: minCommentSize }));
    }
    if (content.length > maxCommentSize) {
        throw new Error(locales.translate('api-errors:chars_too_long', { field: 'content', size: maxCommentSize }));
    }
    if (!postId) {
        throw new Error(locales.translate('api-errors:is_required', { field: 'postId' }));
    }
    if (parent && isNaN(Number(parent))) {
        throw new TypeError(locales.translate('api-errors:invalid_type', {
            field: 'parent',
            expected: 'number',
            got: typeof parent,
        }));
    }

    const postkey = 'post:' + postId;
    const post: IPost = await database.getObjects(postkey);
    if (!post) {
        throw new Error(locales.translate('api-errors:no_such_entity', { entity: 'post', id: postId }));
    }
    if (parent) {
        const parentCommentKey = 'comment:' + parent;
        const parentComment: IComment = await database.getObjects(parentCommentKey);
        if (!parentComment) {
            throw new Error(locales.translate('api-errors:no_comment_with_parent', { id: parent }));
        }
    }

    const comment: IComment = {};

    const timestamp = Utilities.getISOTimestamp();
    const now = Date.now();
    const id = await PostUtils.generateNextCommentId();
    const key = `comment:${id}`;

    comment.commentId = id;
    comment.postId = postId;
    comment.userid = Number(userid);
    comment.content = content;
    comment.likes = 0;
    comment.replies = 0;
    comment.parent = parent || null;
    comment.reportCount = 0;
    comment.edited = false;
    comment.reported = false;
    comment.status = 'published';
    comment.createdAt = timestamp;
    comment.updatedAt = timestamp;

    const bulkAddSets = [
        ['post:' + postId + ':comment', key, now],
    ];

    if (parent) {
        bulkAddSets.push(['comment:' + parent + ':reply', key, now]);
    } else {
        bulkAddSets.push(['post:' + postId + ':comment:parent', key, now]);
    }

    const [ack,] = await Promise.all([
        database.setObjects(key, comment),
        database.sortedSetAddKeys(bulkAddSets),
        database.incrementFieldCount('comments', 'post:' + postId),
    ]);

    return comment;
}

const remove = async function remove(commentId: number, postId: number, caller: number) {
    commentId = Number(commentId);
    postId = Number(postId);
    caller = Number(caller);

    if (!commentId || !postId || !caller) {
        throw new Error(locales.translate('api-errors:are_required', { fields: 'commentId, postId, caller' }));
    }

    const key = 'comment:' + commentId;
    const comment = await getById(commentId);
    if (!comment) {
        throw new Error(locales.translate('api-errors:no_such_entity', {entity: 'comment', id: commentId}));
    }

    if (comment.userid != caller) {
        if (!await User.isAdministrator(caller)) {
            throw new Error(locales.translate('api-errors:unauthorized'));
        }
    }

    const isParent = !Boolean(comment.parent);
    const promises: Promise<any>[] = [];
    const bulkRemoveSets = [
        ['post:' + postId + ':comment', key],
        ['comment:' + commentId + ':reply', key]
    ];

    if (isParent) {
        const replySets = await database.fetchSortedSetsRangeReverse('comment:' + commentId + ':reply', 0, -1);
        promises.push(database.deleteObjectsWithKeys(replySets));
        
    } else {
        bulkRemoveSets.push(['post:' + postId + ':comment:parent', key])
    }

    promises.push(database.decrementFieldCount('comments', 'post:' + postId));
    promises.push(database.sortedSetRemoveKeys(bulkRemoveSets));
    promises.push(database.deleteObjects(key));

    await Promise.all(promises);
}

async function populateCommentAuthors(data: IComment[]): Promise<IComment[]> {
    let authorsMap = new Map();
    let authors = await User.getUsersById(data.map(e => Number(e.userid)), userFields);

    authors.forEach((author: IUser) => {
        authorsMap.set(author.userid, author);
    });

    return data.map((item) => {
        item.author = authorsMap.get(item.userid);

        return item;
    });
}

export default {
    create, getWithPostId, getReplies, getById, remove
} as const;