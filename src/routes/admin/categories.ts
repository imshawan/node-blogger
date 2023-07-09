import { Router } from 'express';
import controllers from '../../controllers';
import { mountAdminPageRoute } from '@src/helpers';
import { hasAdministratorAccess } from '@src/middlewares';


const router = Router();

mountAdminPageRoute(router, '/', [hasAdministratorAccess], controllers.administrator.categories.get);
mountAdminPageRoute(router, '/create', [hasAdministratorAccess], controllers.administrator.categories.create);

export default router;