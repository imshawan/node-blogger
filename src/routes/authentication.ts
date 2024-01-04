import { Router } from 'express';
import controllers from '../controllers';
import { mountPageRoute, mountApiRoute } from '@src/helpers';
import { checkRequiredFields, requireLogin } from '@src/middlewares';

const router = Router();

mountPageRoute(router, '/signin', [], controllers.authentication.signIn);
mountPageRoute(router, '/register', [], controllers.authentication.register);
mountPageRoute(router, '/register/complete', [requireLogin.bind(null, '/register/complete')], controllers.authentication.consent);
mountPageRoute(router, '/password/reset', [], controllers.authentication.resetPassword);

/**
 * @date 17-03-2023
 * @author imshawan <hello@imshawan.dev>
 * @description All the authentication related API routes goes here and will be maintained along with the
 * page routes for better perfomance and redirections.
 * 
 * Redirections in API specific routes are messy, handling them with FORM submissions are better than manually
 * performing API calls
 */

mountApiRoute(router, 'post', '/signin', [checkRequiredFields.bind(null, ['username', 'password'])], controllers.api.authentication.signIn);
mountApiRoute(router, 'post', '/signout', [], controllers.api.authentication.signout);
mountApiRoute(router, 'post', '/register', [], controllers.api.authentication.register);
mountApiRoute(router, 'post', '/password/reset', [], controllers.api.authentication.resetPassword);

export default router
