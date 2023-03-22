import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';

const router = Router();

mountApiRoute(router, 'get', '/validate/username/:username', [], controllers.api.user.checkUsername);
mountApiRoute(router, 'post', '/validate/password', [], controllers.api.user.checkPassword);

export default router;

