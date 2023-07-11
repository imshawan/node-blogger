import { Router } from 'express';
import controllers from '../../controllers';
import { mountAdminPageRoute } from '@src/helpers';
import { hasAdministratorAccess } from '@src/middlewares';


const router = Router();

mountAdminPageRoute(router, '/', [hasAdministratorAccess], controllers.administrator.users.get);

export default router;