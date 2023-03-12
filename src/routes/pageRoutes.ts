import { Router } from 'express';
import controllers from '../controllers';
import {CORS, corsWithOptions} from '../middlewares';
import { mountPageRoute } from '@src/helpers';

const router = Router();

mountPageRoute(router, '/', [CORS], controllers.blog.get);

export default router
