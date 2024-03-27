import { Router } from 'express';
import controllers from '../controllers';
import { mountPageRoute } from '@src/helpers';
import { requireLogin } from '@src/middlewares';

const router = Router();

mountPageRoute(router, '/', [], controllers.blog.get);
mountPageRoute(router, '/posts', [], controllers.blog.posts);
mountPageRoute(router, '/posts/:postId/:slug', [], controllers.blog.getPostBySlug);
mountPageRoute(router, '/categories', [], controllers.category.get);
mountPageRoute(router, '/tags/:tagId/:slug', [], controllers.blog.getPostsByTag);

export default router
