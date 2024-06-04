import _ from "lodash";
import { database } from "@src/database";
import * as Utilities from "@src/utilities";
import { application } from "@src/application";
import { IComment, IPost } from "@src/types";
import locales from "@src/locales";
import PostUtils from "./utils";

const MIN_CONTENT_SIZE = 5,
    MAX_CONTENT_SIZE = 255;

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
        throw new Error(locales.translate('api-errors:is_required', {field: 'content'}));
    }
    if (content.length < minCommentSize) {
        throw new Error(locales.translate('api-errors:chars_too_short', {field: 'content', size: minCommentSize}));
    }
    if (content.length > maxCommentSize) {
        throw new Error(locales.translate('api-errors:chars_too_long', {field: 'content', size: maxCommentSize}));
    }
    if (!postId) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'postId'}));
    }
    if (parent && typeof parent != 'number') {
        throw new TypeError(locales.translate('api-errors:invalid_type', {
            field: 'parent',
            expected: 'number',
            got: typeof parent,
        }));
    }

    const postkey = 'post:' + postId;
    const post: IPost = await database.getObjects(postkey);
    if (!post) {
        throw new Error(locales.translate('api-errors:no_such_entity', {entity: 'post', id: postId}));
    }
    if (parent) {
        const parentCommentKey = 'comment:' + parent;
        const parentComment: IComment = await database.getObjects(parentCommentKey);
        if (!parentComment) {
            throw new Error(locales.translate('api-errors:no_comment_with_parent', {id: parent}));
        }
    }

    const comment: IComment = {};

    const timestamp = Utilities.getISOTimestamp();
    const now = Date.now();
    const id = await PostUtils.generateNextCommentId();
    const key = `comment:${id}`;

    comment.postId = postId;
    comment.userid = Number(userid);
    comment.content = content;
    comment.likes = 0;
    comment.replies = [];
    comment.parent = parent;
    comment.replyCount = 0;
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
    }

    const [ack, ] = await Promise.all([
        database.setObjects(key, comment),
        database.sortedSetAddKeys(bulkAddSets),
    ]);

    return comment;
}

export default {
    create,
} as const;