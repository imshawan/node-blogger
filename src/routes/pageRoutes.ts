import { Router } from 'express';
import controllers from '../controllers';
import { mountPageRoute } from '@src/helpers';

const router = Router();

mountPageRoute(router, '/', [], controllers.blog.get);

export default router
