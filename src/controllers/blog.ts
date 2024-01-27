import { NavigationManager } from '@src/utilities/navigation';
import { Request, Response } from 'express';
import category from '@src/category';
import Post from '@src/post';
import { MutableObject } from '@src/types';
import { notFoundHandler } from '@src/middlewares';
import { getUserByUserId } from '@src/user';

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

const getPostBySlug = async function (req: Request, res: Response) {
    let {postId, slug} = req.params;
    
    const post = await Post.data.getPostById(Number(postId));
    if (!post) {
        return notFoundHandler(req, res);
    }

    const author = await getUserByUserId(post.userid);

    const page = {
        navigation:  new NavigationManager().get('posts'),
        title: post.title,
        post,
        author
    };

    res.render('blog/single', page);
}

export default {
    get, posts, getPostBySlug
  } as const;