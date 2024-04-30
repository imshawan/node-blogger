import { ICategory, ICategoryTag, IPost, IUser } from "../src/types";
import Category from "../src/category";
import Post from "../src/post";
import {template as Template} from "../src/email";
import {database, initializeDbConnection} from "../src/database";
import data from "./data/data.json";
import emailTemplates from "./data/email-templates.json";
import _ from "lodash";
import path from "path";
import fs from "fs";
import { Collections } from "../src/constants";

const defaultTemplatesDir = path.join('data', 'templates');

export async function initializeBlogWithData(user: IUser): Promise<void> {
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const {userid} = user;

        let {name, description, tags, posts} = element;
        let tagsData: ICategoryTag[] = [],
            postsData: IPost[] = [];

        const category: ICategory = await Category.create({userid, name, description});

        if (tags && tags.length) {
            tagsData = await Promise.all(tags.map(async (tag) => {
                return await Category.tags.create({...tag, userid, cid: category.cid});
            }));
        }

        if (posts && posts.length) {
            postsData = await Promise.all(posts.map(async (post) => {
                let categories = ['category:' + category.cid],
                    tagKeys = tagsData.map(tag => 'tag:' + tag.tagId);

                return await Post.create({
					...post,
					userid,
					categories,
					tags: tagKeys,
					status: 'published',
				})
            }));
        }
    }
}

export async function initializeDefaultEmailTemplates (userid: number): Promise<void> {
    for (let index = 0; index < emailTemplates.length; index++) {
        const template = emailTemplates[index];
        const templateSlug = template.slug;

        template.html = fs.readFileSync(path.join(defaultTemplatesDir, templateSlug + '.hbs'), 'utf8');

        await Template.create(template, userid)
    }
}

export async function initializeDatabaseIndexing(databaseConf: {uri: string; db: string}): Promise<void> {
    const Client = await initializeDbConnection(databaseConf);
    const collection = Client.collection(Collections.DEFAULT);

    await collection.createIndexes([
        {key: {_key: 1}},
        {key: { _key: 1, rank: -1 }},
    ], {unique: true, background: true});

    await collection.createIndex({ _key: 1, value: -1 }, { background: true, unique: true, sparse: true });
}