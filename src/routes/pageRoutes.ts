import { Router } from 'express';
import controllers from '../controllers';
import { mountPageRoute } from '@src/helpers';
import { requireLogin } from '@src/middlewares';

const router = Router();

mountPageRoute(router, '/', [], controllers.blog.get);
mountPageRoute(router, '/posts/create', [], controllers.blog.create);

export default router
