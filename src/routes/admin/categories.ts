import { Router } from 'express';
import controllers from '../../controllers';
import { mountAdminPageRoute } from '@src/helpers';

const router = Router();

mountAdminPageRoute(router, '/', [], controllers.administrator.categories.get);
mountAdminPageRoute(router, '/create', [], controllers.administrator.categories.create);
mountAdminPageRoute(router, '/:cid/:slug?', [], controllers.administrator.categories.getBySlug);

export default router;