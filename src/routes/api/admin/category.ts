import { NextFunction, Router } from 'express';
import controllers from '../../../controllers';
import { mountApiRoute } from '@src/helpers';
import { checkRequiredFields } from '@src/middlewares';
import { FileStore } from '@src/middlewares';
import { MultipartyForm } from '@src/middlewares';

const router = Router();

const fileStorage = new FileStore();
const fileuploadMiddleware = fileStorage.initialize();

mountApiRoute(router, 'get', '/', [], controllers.api.category.get);
mountApiRoute(router, 'post', '/', [fileuploadMiddleware, checkRequiredFields.bind(null, ['name'])], controllers.api.category.create);
mountApiRoute(router, 'put', '/:id', [fileuploadMiddleware], controllers.api.category.edit);
mountApiRoute(router, 'delete', '/:id', [], controllers.api.category.delete);

mountApiRoute(router, 'post', '/:id/tags', [checkRequiredFields.bind(null, ['name'])], controllers.api.category.tags.create);
mountApiRoute(router, 'delete', '/:id/tags/:tagId', [], controllers.api.category.tags.remove);

export default router;