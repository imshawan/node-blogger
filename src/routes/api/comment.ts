import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';
import { requireAuthentication, checkRequiredFields, FileStore } from '@src/middlewares';

const router = Router();
const fileStorage = new FileStore();
const fileuploadMiddleware = fileStorage.initialize();

mountApiRoute(router, 'get', '/:postId', [requireAuthentication], controllers.api.comment.get);
mountApiRoute(router, 'post', '/', [requireAuthentication, checkRequiredFields.bind(null, ['content'])], controllers.api.comment.create);
mountApiRoute(router, 'delete', '/:postId/:id', [requireAuthentication], controllers.api.comment.remove);

export default router;

