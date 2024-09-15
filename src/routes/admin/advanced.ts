import { Router } from 'express';
import controllers from '../../controllers';
import { mountAdminPageRoute } from '@src/helpers';

const router = Router();

mountAdminPageRoute(router, '/database', [], controllers.administrator.advanced.databaseInfo);

export default router;