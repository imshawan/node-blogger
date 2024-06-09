import { Request } from "express";
import {database} from "@src/database";
import * as Utilities from "@src/utilities";
import * as Helpers from "@src/helpers";
import Comments from "@src/post/comments";
import { IPost, MulterFilesArray, IComment } from "@src/types";
import locales from '@src/locales';

const validCommentFields = [
    'author',
    'commentId',
    'content',
    'createdAt',
    'edited',
    'likes',
    'postId',
    'replies',
    'parent',
] as (keyof IComment)[];

const create = async (req: Request) => {
    const userid = Helpers.parseUserId(req);
    let {content, parent, postId} = req.body;

    // Lets convert the html content to normal string if the client sends it
    content = Helpers.isValidHtml(content) ? Utilities.sanitizeHtml(content) : content;

    const commentData: IComment = {
        content,
        userid: userid,
        postId: Number(postId),
    }

    if (parent) {
        if (isNaN(parent)) {
            throw new TypeError(locales.translate('api-errors:invalid_type', {
                field: 'parent',
                expected: 'number',
                got: typeof parent,
            }));
        }

        commentData.parent = Number(parent);
    }

    const comment = await Comments.create(commentData);

    return {
        message: locales.translate('api-common:created'),
        data: comment,
    };
}

const get = async (req: Request) => {
    const {query, params} = req;
    const postId = Number(params.postId);
    const replies = Utilities.types.isBoolean(query.replies) ? Utilities.types.parseBoolean(String(query.replies).toLowerCase()) : undefined;
    const commentId = Number(query.id);
    const requireReplies = replies && commentId;

    if (!postId) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'postId'}));
    }

    let perPage = Number(query.perPage),
        page = Number(query.page), 
        url = [req.baseUrl, req.url].join('');

    if (!perPage) {
        perPage = 15;
    }
    if (isNaN(page) || !page) {
        page = 1;
    }

    const data = await Comments[requireReplies ? 'getReplies' : 'getWithPostId'](requireReplies ? commentId : postId, perPage, page, validCommentFields);

    return Helpers.paginate(data.comments, data.total, perPage, page, url);
}

const remove = async (req: Request) => {
    const {params} = req;
    const userid = Helpers.parseUserId(req);
    const postId = Number(params.postId),
        commentId = Number(params.id);

    if (!postId) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'postId'}));
    }
    if (!commentId) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'commentId'}));
    }

    await Comments.remove(commentId, postId, userid);
}

export default {
    create, get, remove
  } as const;