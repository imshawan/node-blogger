import { NavigationManager } from '@src/utilities/navigation';
import { Request, Response } from 'express';
import category from '@src/category';
import Post from '@src/post';
import { notFoundHandler } from '@src/middlewares';
import * as User from '@src/user';
import * as Helpers from "@src/helpers";
import moment from 'moment';

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
        perPage = 8;
    }
    if (isNaN(page) || !page) {
        page = 1;
    }

    const posts = await Post.data.getPosts({page, perPage});

    const postData = await Promise.all(posts.map(async (post: any) => {
        post.createdAt = moment(post.createdAt).format('DD MMM, yyyy');
        post.user = await User.getUserWIthFields(post.userid, ['username', 'picture', 'fullname']);

        return post;
    }));

    const totalPages = Math.ceil(postData.length / perPage);

    const pageData = {
        title: 'Posts',
        navigation:  new NavigationManager().get('posts'),
        categories:  await category.data.getAllCategories(5, 1, ),
        posts: postData || [],
        pagination: Helpers.generatePaginationItems(page, totalPages),
    };

    res.render('blog/posts', pageData);
}

const getPostBySlug = async function (req: Request, res: Response) {
    let {postId, slug} = req.params;
    
    const post = await Post.data.getPostById(Number(postId));
    if (!post) {
        return notFoundHandler(req, res);
    }

    const [author, ] = await Promise.all([
        User.getUserByUserId(post.userid),
        Post.utils.incrementViewCount(Number(postId), req)
    ]);

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