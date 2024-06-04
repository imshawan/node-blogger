import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';
import { requireAuthentication, checkRequiredFields, FileStore } from '@src/middlewares';

const router = Router();
const fileStorage = new FileStore();
const fileuploadMiddleware = fileStorage.initialize();

mountApiRoute(router, 'post', '/', [requireAuthentication, checkRequiredFields.bind(null, ['content'])], controllers.api.comment.create);

export default router;

