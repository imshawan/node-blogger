import { NavigationManager } from '@src/utilities/navigation';
import { Request, Response } from 'express';
import Category from '@src/category';
import Post from '@src/post';
import { notFoundHandler } from '@src/middlewares';
import * as User from '@src/user';
import * as Utilities from "@src/utilities";
import moment from 'moment';
import { ValueError } from '@src/helpers';
import * as Helpers from "@src/helpers";

const DATE_FORMAT = 'DD MMM, yyyy';

const get = async function (req: Request, res: Response) {
    let categories = await Category.data.getAllCategories(5, 1, );

    categories = categories.map((category: any) => {
        category.posts = Utilities.abbreviateNumber(category.posts);
        category.tags = Utilities.abbreviateNumber(category.tags);
        category.createdAt = moment(new Date(String(category.createdAt))).format(DATE_FORMAT);

        return category;
    })

    const pageData = {
        title: 'Categories',
        navigation: new NavigationManager().get('categories'),
        categories,
    };

    res.render('categories/index', pageData);
}

const getPostsByCategory = async function (req: Request, res: Response) {
    const categoryId = Number(req.params.id),
        query = req.query;

    let perPage = Number(query.perPage);
    let page = Number(query.page);

    if (!perPage) {
        perPage = 6;
    }
    if (isNaN(page) || !page) {
        page = 1;
    }

    if (!categoryId) {
        throw new ValueError('Invalid category id');
    }

    const [data, category] = await Promise.all([
        Category.post.getPosts(categoryId, {perPage, page}),
        Category.data.getCategoryByCid(categoryId)
    ]);

    const totalPages = Math.ceil(data.total / perPage);
    let posts = (data.posts && data.posts.length) ? data.posts : [];

    posts = posts.map((post: any) => {
        post.createdAt = moment(new Date(String(post.createdAt))).format(DATE_FORMAT);
        post.categories = undefined;

        return post;
    });

    const pageData = {
        title: category.name + ' - Posts',
        navigation:  new NavigationManager().get('posts'),
        posts: posts,
        category: category ?? {},
        pagination: Helpers.generatePaginationItems(req.url, page, totalPages),
    };

    res.render('categories/posts', pageData);
}

export default {
    get, getPostsByCategory
  } as const;