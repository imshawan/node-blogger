import { NavigationManager } from '@src/utilities/navigation';
import { Request, Response } from 'express';
import category from '@src/category';
import Post from '@src/post';
import { notFoundHandler } from '@src/middlewares';
import * as User from '@src/user';
import * as Utilities from "@src/utilities";
import moment from 'moment';

const DATE_FORMAT = 'DD MMM, yyyy';

const get = async function (req: Request, res: Response) {
    let categories = await category.data.getAllCategories(5, 1, );

    categories = categories.map((category: any) => {
        category.posts = Utilities.abbreviateNumber(category.posts);
        category.tags = Utilities.abbreviateNumber(category.tags);
        category.createdAt = moment(category.createdAt).format(DATE_FORMAT);

        return category;
    })

    const pageData = {
        title: 'Categories',
        navigation: new NavigationManager().get('categories'),
        categories,
    };

    res.render('categories/index', pageData);
}

export default {
    get,
  } as const;