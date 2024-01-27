import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';
import { requireAuthentication, checkRequiredFields, FileStore } from '@src/middlewares';

const router = Router();
const fileStorage = new FileStore();
const fileuploadMiddleware = fileStorage.initialize();

mountApiRoute(router, 'get', '/', [], controllers.api.blog.get);
mountApiRoute(router, 'post', '/', [requireAuthentication, fileuploadMiddleware, checkRequiredFields.bind(null, ['title', 'content', 'categories'])], controllers.api.blog.create);

export default router;

