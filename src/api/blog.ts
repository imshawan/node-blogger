import { Request } from "express";
import {database} from "@src/database";
import { sanitizeHtml } from "@src/utilities";
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

    writeData.content = sanitizeHtml(content);
    writeData.title = sanitizeHtml(title);
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

    const post = await Posts.create(writeData);
    return post.slug;
}

export default {
    get, create,
  } as const;