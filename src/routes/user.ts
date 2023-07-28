import { Router } from 'express';
import controllers from '../controllers';
import { mountPageRoute } from '@src/helpers';
import { requireLogin } from '@src/middlewares';

const router = Router();

mountPageRoute(router, '/', [requireLogin], controllers.users.get);
mountPageRoute(router, '/:username', [requireLogin], controllers.users.getByUsername);
mountPageRoute(router, '/:username/edit', [requireLogin], controllers.users.edit);

export default router;