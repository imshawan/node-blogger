import { Router } from 'express';
import controllers from '../../controllers';
import { mountPageRoute } from '@src/helpers';
import { checkRequiredFields, requireAuthentication} from '@src/middlewares';

const router = Router();
// Need to create a admin validator middleware
mountPageRoute(router, '/create', [], controllers.administrator.categories.create);

export default router;