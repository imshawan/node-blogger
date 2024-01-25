import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';
import { requireAuthentication, checkRequiredFields } from '@src/middlewares';

const router = Router();

mountApiRoute(router, 'get', '/', [], controllers.api.blog.get);
mountApiRoute(router, 'post', '/', [requireAuthentication, checkRequiredFields.bind(null, ['title', 'content'])], controllers.api.blog.create);

export default router;

