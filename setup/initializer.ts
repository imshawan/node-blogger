import { ICategory, ICategoryTag, IPost, IUser } from "../src/types";
import Category from "../src/category";
import Post from "../src/post";
import {database, initializeDbConnection} from "../src/database";
import data from "./data/data.json";
import _ from "lodash";

export async function initializeBlogWithData(user: IUser, databaseConf: {uri: string; db: string}) {
    await initializeDbConnection(databaseConf);

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