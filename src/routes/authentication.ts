import { Router } from 'express';
import controllers from '../controllers';
import { mountPageRoute, mountApiRoute } from '@src/helpers';

const router = Router();

mountPageRoute(router, '/signin', [], controllers.authentication.signIn);

mountApiRoute(router, 'post', '/signin', [], controllers.api.authentication.signIn);

export default router
