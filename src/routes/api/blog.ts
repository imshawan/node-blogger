import { Router } from 'express';
import controllers from '../../controllers';
import {CORS, corsWithOptions} from '../../middlewares';
import { mountApiRoute } from '@src/helpers';

const router = Router();

mountApiRoute(router, 'get', '/', [CORS], controllers.api.blog.get);

export default router;

