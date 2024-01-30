import { NavigationManager } from '@src/utilities/navigation';
import { Request, Response } from 'express';
import category from '@src/category';
import Post from '@src/post';
import { IPost, MutableObject } from '@src/types';
import { notFoundHandler } from '@src/middlewares';
import { getUserByUserId } from '@src/user';
import { clipContent, textFromHTML } from '@src/utilities';
import { application } from "@src/application";

const get = async function (req: Request, res: Response) {  
    const page = {
        title: 'Home',
        navigation: new NavigationManager().get('home'),
    };

    res.render('blog/index', page);
}

const renderPosts = async function (req: Request, res: Response) {
    const {query, params} = req;
    let {search, sortBy} = query;
    let perPage = Number(query.perPage);
    let page = Number(query.page);
    let url = [req.baseUrl, req.url].join('');

    if (!perPage) {
        perPage = 15;
    }
    if (isNaN(page) || !page) {
        page = 1;
    }

    const maxPostBlurbSize = application.configurationStore?.maxPostBlurbSize || Post.data.MAX_BLURB_SIZE;
    const posts = await Post.data.getPosts({page, perPage});
    const postData = posts.map((post: IPost) => {
        let content = textFromHTML(post.content ?? '');
        let clipped = clipContent(content, maxPostBlurbSize);

        post.blurb = clipped.split(' ').length < maxPostBlurbSize ? clipped : (clipped.endsWith('.') ? clipped : (clipped + '...'));

        return post;
    });

    const pageData = {
        title: 'Posts',
        navigation:  new NavigationManager().get('posts'),
        categories:  await category.data.getAllCategories(5, 1, ),
        posts: postData || [],
    };

    res.render('blog/posts', pageData);
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
    get, posts: renderPosts, getPostBySlug
  } as const;