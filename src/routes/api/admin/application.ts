import { NextFunction, Router } from 'express';
import controllers from '../../../controllers';
import { mountApiRoute } from '@src/helpers';
import { checkRequiredFields, checkRequiredFileFields } from '@src/middlewares';
import { FileStore } from '@src/middlewares';
import { MultipartyForm } from '@src/middlewares';

const router = Router();

const fileStorage = new FileStore();
const fileuploadMiddleware = fileStorage.initialize();

mountApiRoute(router, 'put', '/common', [], controllers.api.application.site.updateCommon);
mountApiRoute(router, 'post', '/site/logo', [fileuploadMiddleware, checkRequiredFileFields.bind(null, ['logo'])], controllers.api.application.site.updateLogo);
mountApiRoute(router, 'post', '/site/favicon', [fileuploadMiddleware, checkRequiredFileFields.bind(null, ['favicon'])], controllers.api.application.site.updateFavicon);

export default router;