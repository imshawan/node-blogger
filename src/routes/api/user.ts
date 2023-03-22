import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';

const router = Router();

mountApiRoute(router, 'get', '/validate/username/:username', [], controllers.api.user.checkUsername);
mountApiRoute(router, 'get', '/validate/email/:email', [], controllers.api.user.checkEmail);

export default router;

