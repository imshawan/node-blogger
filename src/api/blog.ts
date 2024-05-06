import { Request } from "express";
import {database} from "@src/database";
import * as Utilities from "@src/utilities";
import * as Helpers from "@src/helpers";
import Posts from "@src/post";
import { IPost, MulterFilesArray } from "@src/types";

const get = async (req: Request) => {
    return {message: 'Ok, working fine.'};
}

const create = async (req: Request) => {
    const userid = Helpers.parseUserId(req);
    const files = req.files as MulterFilesArray[];

    let {title, content, categories, status} = req.body;
    let tags: string[] = req.body.tags;
    let featuredImage = '';

    if (!tags) {
        tags = [];
    }
    if (typeof tags === 'string') {
        tags = [tags];
    }
    if (!categories || !Array.isArray(categories) || !categories.length) {
        throw new Error('A valid category is required for creating a post.');
    }
    
    const writeData: IPost = {};

    writeData.content = Utilities.sanitizeHtml(content);
    writeData.title = Utilities.sanitizeHtml(title);
    writeData.categories = categories;
    writeData.status = status;
    writeData.tags = tags;
    writeData.userid = userid
    writeData.wordCount = String(content).length;

    if (files && files.length) {
        const image = files.find((file) => file.fieldname == 'featuredImage');
        if (image && Object.hasOwnProperty.bind(image)('url')) {
            featuredImage = image.url;
        }
    }

    writeData.featuredImage = featuredImage;

    let post = await Posts.create(writeData);
    return Utilities.filterObjectByKeys(post, ['title', 'userid', 'slug', 'postId']);
}

const handleLikes = async (req: Request, action: 'like' | 'unlike') => {
    const postId = Number(req.params.postId);
    const userid = Helpers.parseUserId(req);
    let count = 0;

    if (!postId) {
        throw new Error('postId is invalid/required.');
    }

    if (!['like', 'unlike'].includes(action)) {
        throw new Error('Invalid action.');
    }

    if (action == 'unlike') {
        count = await Posts.likes.unlike(postId, userid);
    } else if (action == 'like') {
        count = await Posts.likes.like(postId, userid);
    }

    return {
        message: Utilities.capitalizeFirstLetter(action) + 'd',
        count: Number(count)
    }
}

const getLikes = async (req: Request) => {
    const query = req.query;
    const postId = Number(req.params.postId);

    if (!postId) {
        throw new Error('postId is invalid/required.');
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

    const data = await Posts.likes.get(postId, perPage, page);

    return Helpers.paginate(data.users, perPage, page, url)
}


export default {
    get, create, getLikes, handleLikes,
  } as const;