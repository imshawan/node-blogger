import { database } from '@src/database';
import { resolveIpAddrFromHeaders, resolveIpFromRequest, slugify } from '@src/utilities';
import { Request } from 'express';
import * as Helpers from '@src/helpers';
import { isAuthenticated } from '@src/middlewares';

const generatePostslug = async function generatePostslug(title: string): Promise<string> {
    let slug = slugify(title);

    const post = await database.getObjects({
        slug: { $regex: new RegExp(`^[0-9]+\/${slug}`), $options: "i" },
        _scheme: "post:postId",
    }, [], {multi: true});

    if (post && post.length) {
        return String(slug + '-' + (post.length + 1));
    }

    return slug;
}

const generateNextPostId = async function generateNextPostId(): Promise<number> {
    const id = await database.incrementFieldCount('post');
    return Number(id);
}

const isValidStatus = function (status: string) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!status) {
        throw new Error('Status is required.');
    }

    return validStatuses.includes(String(status).toLowerCase().trim());
}

const getKey = function (postId: number): string {
    if (!postId) {
        throw new Error('A valid post id is required');
    }
    if (isNaN(postId)) {
        throw new Error('Post id must be a number, found ' + typeof postId);
    }

    return 'post:' + postId;
}

const incrementViewCount = async function (postId: number, req: Request) {
    await incrementCountByType(req, postId, 'views');
}

const incrementLikeCount = async function (postId: number, req: Request) {
    await incrementCountByType(req, postId, 'likes');
}

const incrementCommentCount = async function (postId: number, req: Request) {
    await incrementCountByType(req, postId, 'comments');
}

async function incrementCountByType(req: Request, postId: number, field: string) {
    let userid = 0,
        postKey = getKey(postId),
        ip = resolveIpAddrFromHeaders(req);

    if (!ip) {
        ip = resolveIpFromRequest(req);
    }

    if (isAuthenticated(req)) {
        userid = Helpers.parseUserId(req);
    }

    const exists = await database.getObjects({_key: postKey + ':views', user: userid, ip});
    if (exists) return;

    await Promise.all([
        database.incrementFieldCount(field, postKey),
        database.setObjects({_key: postKey + ':' + field, _scheme: 'post:postId:' + field,
            value: postId,
            user: userid,
            ip
        }),
    ])
}

export default {
    generatePostslug, generateNextPostId, isValidStatus, incrementCommentCount, incrementLikeCount,
    incrementViewCount, getKey,
} as const