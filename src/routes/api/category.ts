import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';
import { checkRequiredFields, requireAuthentication} from '@src/middlewares';

const router = Router();

mountApiRoute(router, 'post', '/', [requireAuthentication, checkRequiredFields.bind(null, ['name'])], controllers.api.category.create);

export default router;