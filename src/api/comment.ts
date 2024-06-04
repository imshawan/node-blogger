import { Request } from "express";
import {database} from "@src/database";
import * as Utilities from "@src/utilities";
import * as Helpers from "@src/helpers";
import Comments from "@src/post/comments";
import { IPost, MulterFilesArray, IComment } from "@src/types";
import locale from '@src/locales';

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
        if (typeof parent !== 'number') {
            throw new TypeError(locale.translate('api-errors:invalid_type', {
                field: 'parent',
                expected: 'number',
                got: typeof parent,
            }));
        }

        commentData.parent = Number(parent);
    }

    const comment = await Comments.create(commentData);

    return {
        message: locale.translate('api-common:created'),
        data: comment,
    };
}


export default {
    create,
  } as const;