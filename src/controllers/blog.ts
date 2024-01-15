import { Request, Response } from 'express';

const get = async function (req: Request, res: Response) {  
    const page = {
        title: 'Home'
    };

    res.render('blog/index', page);
}

const create = async function (req: Request, res: Response) {  
    const page = {
        title: 'New post'
    };

    res.render('blog/create', page);
}

const posts = async function (req: Request, res: Response) {
    const page = {
        title: 'Posts'
    };

    res.render('blog/posts', page);
}

export default {
    get, create, posts
  } as const;