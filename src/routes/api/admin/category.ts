import { Router } from 'express';
import controllers from '../../../controllers';
import { mountApiRoute } from '@src/helpers';
import { checkRequiredFields } from '@src/middlewares';
import { FileStore } from '@src/middlewares';

const router = Router();

const fileStorage = new FileStore()
const fileuploadMiddleware = fileStorage.initialize();

mountApiRoute(router, 'post', '/', [checkRequiredFields.bind(null, ['name']), fileuploadMiddleware], controllers.api.category.create);

export default router;