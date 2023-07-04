import { Router } from 'express';
import controllers from '../../controllers';
import { mountPageRoute } from '@src/helpers';
import { hasAdministratorAccess } from '@src/middlewares';


const router = Router();

mountPageRoute(router, '/create', [hasAdministratorAccess], controllers.administrator.categories.create);

export default router;