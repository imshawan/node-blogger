import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';

const router = Router();

mountApiRoute(router, 'get', '/', [], controllers.api.blog.get);

export default router;

