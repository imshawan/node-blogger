import { NextFunction, Router } from 'express';
import controllers from '../../../controllers';
import { mountApiRoute } from '@src/helpers';
import { checkRequiredFields } from '@src/middlewares';
import { FileStore } from '@src/middlewares';
import { MultipartyForm } from '@src/middlewares';

const router = Router();

const fileStorage = new FileStore()
const fileuploadMiddleware = fileStorage.initialize();

mountApiRoute(router, 'post', '/', [fileuploadMiddleware, checkRequiredFields.bind(null, ['name'])], controllers.api.category.create);
mountApiRoute(router, 'delete', '/:id', [], controllers.api.category.delete);

export default router;