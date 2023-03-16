import { Router } from 'express';
import controllers from '../controllers';
import { mountPageRoute, mountApiRoute } from '@src/helpers';

const router = Router();

mountPageRoute(router, '/signin', [], controllers.authentication.signIn);
mountPageRoute(router, '/register', [], controllers.authentication.register);

/**
 * @date 17-03-2023
 * @author imshawan <hello@imshawan.dev>
 * @description All the authentication related API routes goes here and will be maintained along with the
 * page routes for better perfomance and redirections.
 * 
 * Redirections in API specific routes are messy, handling them with FORM submissions are better than manually
 * performing API calls
 */

mountApiRoute(router, 'post', '/signin', [], controllers.api.authentication.signIn);
mountApiRoute(router, 'post', '/register', [], controllers.api.authentication.register);

export default router
