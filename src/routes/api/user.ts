import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';
import { requireAuthentication, checkRequiredFields } from '@src/middlewares';
import { FileStore } from '@src/middlewares';

const router = Router();
const fileStorage = new FileStore();
const fileuploadMiddleware = fileStorage.initialize();

mountApiRoute(router, 'put', '/:userid', [requireAuthentication], controllers.api.user.update);
mountApiRoute(router, 'put', '/:userid/picture', [fileuploadMiddleware, requireAuthentication], controllers.api.user.updatePicture);

// Public routes
mountApiRoute(router, 'get', '/validate/username/:username', [], controllers.api.user.checkUsername);
mountApiRoute(router, 'post', '/validate/password', [], controllers.api.user.checkPassword);

export default router;

