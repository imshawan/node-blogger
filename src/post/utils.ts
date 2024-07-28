import { database } from '@src/database';
import { sanitizeString, resolveIpAddrFromHeaders, resolveIpFromRequest, slugify, clipContent, textFromHTML, 
    timeAgo as calculateTimeAgo } from '@src/utilities';
import { Request } from 'express';
import * as Helpers from '@src/helpers';
import { isAuthenticated } from '@src/middlewares';
import { IPost, MutableObject, ValidUserFields } from '@src/types';
import * as User from '@src/user';
import Posts from './data';
import { POST_WEIGHTS } from '@src/constants';
import { application } from '@src/application';
import _ from 'lodash';
import locales from '@src/locales';

const MAX_BLURB_SIZE = 35;

const generatePostslug = async function generatePostslug(title: string): Promise<string> {
    let slug = slugify(title);

    const post = await database.getObjects('post:slug:' + sanitizeString(slug), [], {multi: true});

    if (post && post.length) {
        return String(slug + '-' + (post.length + 1));
    }

    return slug;
}

const generateNextPostId = async function generateNextPostId(): Promise<number> {
    const id = await database.incrementFieldCount('post');
    return Number(id);
}

const generateNextCommentId = async function generateNextCommentId(): Promise<number> {
    const id = await database.incrementFieldCount('comment');
    return Number(id);
}

const isValidStatus = function (status: string) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!status) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'status'}));
    }

    return validStatuses.includes(String(status).toLowerCase().trim());
}

const getKey = function (postId: number): string {
    if (!postId) {
        throw new Error(locales.translate('api-errors:is_required', {field: 'postId'}));
    }
    if (isNaN(postId)) {
        throw new Error(locales.translate('api-errors:invalid_type', {field: 'postId', expected: 'number', got: typeof postId}));
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

const populateUserData = async function (data: IPost, fields?: ValidUserFields[]) {
    let defaults: ValidUserFields[] = ['userid', 'fullname', 'picture', 'username'];
    let userid = Number(data.userid);

    if (isNaN(userid)) return {}
    if (!fields || !Array.isArray(fields)) {
        fields = defaults;
    }
    if (!fields.includes('userid')) {
        fields.push('userid');
    }

    data.author = await User.getUserWIthFields(userid, fields);
    return data;
}

const preparePostBlurb = function (postData: IPost): string {
    let {content} = postData;
    let maxPostBlurbSize = application.configurationStore?.maxPostBlurbSize || MAX_BLURB_SIZE;

    if (!content) return '';
    
    content = textFromHTML(content ?? '');
    let clipped = clipContent(content, maxPostBlurbSize);

    return clipped.split(' ').length < maxPostBlurbSize ? clipped : (clipped.endsWith('.') ? clipped : (clipped + '...'));
}

const timeAgo = (postData: IPost): IPost => {
    let {createdAt} = postData;
    if (!createdAt) return postData;

    const _timeAgo = calculateTimeAgo(new Date(createdAt));

    return _.merge(postData, {timeAgo: _timeAgo});
}

const serializePost = function (post: IPost): IPost {
    const fields = ['likes', 'comments', 'views'] as (keyof IPost)[];
    const serializedObj: MutableObject = Object.assign({}, post);

    fields.forEach(field => {
        if (!post[field] || post[field] == -1) {
            serializedObj[field] = 0;
        }
    });

    return serializedObj;
}

async function incrementCountByType(req: Request, postId: number, field: 'likes' | 'views' | 'comments') {
    let userid = 0,
        postKey = getKey(postId),
        ip = resolveIpAddrFromHeaders(req);

    if (!ip) {
        ip = resolveIpFromRequest(req) ?? '';
    }

    ip = String(ip).trim();
    if (!ip) {
        ip = '0.0.0.0'; // IP Anywhere (global)
    }

    if (isAuthenticated(req)) {
        userid = Helpers.parseUserId(req);
    }

    const key = postKey + ':' + field + ':user:' + userid
    const exists = await database.getSortedSetValue(key, String(ip));
    if (exists) return;

    await Promise.all([
        database.incrementFieldCount(field, postKey),
        database.incrementFieldCount(field, 'post:' + postId),
        database.sortedSetAddKey(key, ip, Date.now()),
        reCalculatePostRank(postId),
    ])
}

async function reCalculatePostRank(postId: number) {
    let post = await Posts.getPostById(postId), 
        postUpdationTime = post.updatedAt ? new Date(post.updatedAt).getTime() : 0,
        rank = (POST_WEIGHTS.views * (post.views ?? 0)) +
                (POST_WEIGHTS.likes * (post.likes ?? 0)) +
                (POST_WEIGHTS.comments * (post.comments ?? 0)) +
                (POST_WEIGHTS.freshness * (Date.now() - postUpdationTime));

    await database.updateSortedSetValue('post:featured', postId, {rank: Math.floor(rank)});
}

export default {
    generatePostslug, generateNextPostId, isValidStatus, incrementCommentCount, incrementLikeCount,
    incrementViewCount, getKey, populateUserData, preparePostBlurb, timeAgo, serializePost, generateNextCommentId,
} as const