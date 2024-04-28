import { NavigationManager } from '@src/utilities/navigation';
import { Request, Response } from 'express';
import category from '@src/category';
import Post from '@src/post';
import { notFoundHandler } from '@src/middlewares';
import * as User from '@src/user';
import * as Helpers from "@src/helpers";
import moment from 'moment';
import { ICategoryTag, IPost } from '@src/types';
import Tag from '@src/category/tags';

const DATE_FORMAT = 'DD MMM, yyyy';
const DEFAULT_POST_FIELDS: (keyof IPost)[] = [
	'postId',
	'userid',
	'blurb',
	'featuredImage',
	'readTime',
	'likes',
	'slug',
	'views',
	'createdAt',
	'comments',
    'title',
]

const get = async function (req: Request, res: Response) { 

    const resolve = async (post: any) => {
        try {
            post.createdAt = moment(post.createdAt).format(DATE_FORMAT);
        } catch (e) {}
        
        post.author = await User.getUserWIthFields(post.userid, ['username', 'picture', 'fullname']);

        return post;
    }

    const [recent, popular, categories] = await Promise.all([
        Post.data.getPosts({page: 1, perPage: 6}),
        Post.data.getPosts({page: 1, perPage: 6, sorting: 'POPULAR'}),
        category.data.getAllCategories(5, 1, ),
    ]);

    const recentPosts = await Promise.all(recent.posts.map(resolve));
    const popularPosts = await Promise.all(popular.posts.map(resolve));

    const page = {
        title: 'Home',
        navigation: new NavigationManager().get('home'),
        categories,
        recents: recentPosts, 
        popular: popularPosts,
    };

    res.render('blog/index', page);
}

const renderPosts = async function (req: Request, res: Response) {
    const {query, params} = req;
    let {search, sortBy} = query;
    let perPage = Number(query.perPage);
    let page = Number(query.page);
    let url = [req.baseUrl, req.url].join(''),
        data: {posts: IPost[], total: number} = {posts: [], total: 0}

    if (!perPage) {
        perPage = 6;
    }
    if (isNaN(page) || !page) {
        page = 1;
    }

    if (search && search.length) {
        data = await Post.data.search(String(search));
    } else {
        data = await Post.data.getPosts({page, perPage});
    }

    const postData = await Promise.all(data.posts.map(async (post: any) => {
        post.createdAt = moment(post.createdAt).format(DATE_FORMAT);
        post.author = await User.getUserWIthFields(post.userid, ['username', 'picture', 'fullname']);

        return post;
    }));

    const totalPages = Math.ceil(data.total / perPage);
    const [categories, featured, popularTags] = await Promise.all([
        category.data.getAllCategories(5, 1, ),
        Post.data.getFeaturedPosts(5),
        category.tags.getPopularTags(8, 0, ['tagId', 'name', 'slug'])
    ])

    const pageData = {
        title: 'Posts',
        navigation:  new NavigationManager().get('posts'),
        categories,
        featured: featured.posts.map((post: IPost) => ({...post, createdAt: moment(post.createdAt).format(DATE_FORMAT)})),
        posts: postData || [],
        tags: (popularTags.tags ?? []).filter(e => e),
        pagination: Helpers.generatePaginationItems(req.url, page, totalPages),
        search: search ?? '',
    };

    res.render('blog/posts', pageData);
}

const getPostBySlug = async function (req: Request, res: Response) {
    let {postId, slug} = req.params;
    
    const post = await Post.data.getPostById(Number(postId));
    if (!post) {
        return notFoundHandler(req, res);
    }

    const tagFields = ['tagId', 'name', 'slug'];
    let tags: ICategoryTag[] | Array<never> = [];

    if (post.tags && post.tags.length) {
        tags = await category.tags.getByKeys(post.tags, tagFields);
    }

    post.createdAt = moment(post.createdAt).format(DATE_FORMAT);

    const [author, ] = await Promise.all([
        User.getUserByUserId(post.userid),
        Post.utils.incrementViewCount(Number(postId), req)
    ]);

    const page = {
        navigation:  new NavigationManager().get('posts'),
        title: post.title,
        post,
        tags: tags ?? [],
        author
    };

    res.render('blog/single', page);
}

const getPostsByTag = async function (req: Request, res: Response) {
    const {query, params} = req;
    let {sortBy} = query;
    let perPage = Number(query.perPage);
    let page = Number(query.page);
    let tagId = params.tagId;
    let tagFields = ['posts', 'tagId', 'name', 'slug', 'followers'];

    if (!perPage) {
        perPage = 6;
    }
    if (isNaN(page) || !page) {
        page = 1;
    }

    const [data, tag, popular] = await Promise.all([
        Post.data.getPostsByTag(Number(tagId), perPage, page, DEFAULT_POST_FIELDS),
        Tag.getById(Number(tagId), tagFields),
        category.tags.getPopularTags(15, 0, tagFields)
    ]);
    const totalPages = Math.ceil(data.total / perPage);

    const postData = await Promise.all(data.posts.map(async (post: any) => {
        post.createdAt = moment(post.createdAt).format(DATE_FORMAT);
        post.author = await User.getUserWIthFields(post.userid, ['username', 'picture', 'fullname']);

        return post;
    }));

    const pageData = {
        title: 'Posts',
        navigation:  new NavigationManager().get('posts'),
        posts: postData || [],
        tag: tag ?? {},
        popularTags: (popular.tags ?? []).filter(e => e),
        pagination: Helpers.generatePaginationItems(req.url, page, totalPages),
    };

    res.render('blog/posts_by_tag', pageData);
}

export default {
    get, posts: renderPosts, getPostBySlug, getPostsByTag,
  } as const;