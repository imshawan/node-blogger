import { NavigationManager } from '@src/utilities/navigation';
import { Request, Response } from 'express';
import category from '@src/category';

const get = async function (req: Request, res: Response) {  
    const page = {
        title: 'Home',
        navigation: new NavigationManager().get('home'),
    };

    res.render('blog/index', page);
}

const posts = async function (req: Request, res: Response) {
    const page = {
        title: 'Posts',
        navigation:  new NavigationManager().get('posts'),
        categories:  await category.data.getAllCategories(5, 1, )
    };

    res.render('blog/posts', page);
}

export default {
    get, posts
  } as const;