import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';
import { requireAuthentication, checkRequiredFields, FileStore } from '@src/middlewares';

const router = Router();
const fileStorage = new FileStore();
const fileuploadMiddleware = fileStorage.initialize();

mountApiRoute(router, 'get', '/', [], controllers.api.blog.get);
mountApiRoute(router, 'post', '/', [requireAuthentication, fileuploadMiddleware, checkRequiredFields.bind(null, ['title', 'content', 'categories'])], controllers.api.blog.create);
mountApiRoute(router, 'post', '/posts/:postId/like', [requireAuthentication], controllers.api.blog.like);
mountApiRoute(router, 'post', '/posts/:postId/unlike', [requireAuthentication], controllers.api.blog.unlike);
mountApiRoute(router, 'get', '/posts/:postId/likes', [requireAuthentication], controllers.api.blog.getLikes);

export default router;

