import { Router } from 'express';
import controllers from '../../controllers';
import { mountAdminPageRoute } from '@src/helpers';

const router = Router();

mountAdminPageRoute(router, '/', [], controllers.administrator.users.get);

export default router;