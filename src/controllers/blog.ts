import { NavigationManager } from '@src/utilities/navigation';
import { Request, Response } from 'express';

const get = async function (req: Request, res: Response) {  
    const page = {
        title: 'Home',
        navigation: new NavigationManager().get('home'),
    };

    res.render('blog/index', page);
}

const create = async function (req: Request, res: Response) {  
    const page = {
        title: 'New post',
        navigation:  new NavigationManager().get('posts'),
    };

    res.render('blog/create', page);
}

const posts = async function (req: Request, res: Response) {
    const page = {
        title: 'Posts',
        navigation:  new NavigationManager().get('posts'),
    };

    res.render('blog/posts', page);
}

export default {
    get, create, posts
  } as const;