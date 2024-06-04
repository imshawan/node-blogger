import { Router, Request, Response, NextFunction } from 'express';
import { requireAuthentication, verifyAdministrator } from '@src/middlewares';
import controllers from '@src/controllers';
import { mountApiRoute } from '@src/helpers';
import blog from './blog';
import user from './user';
import admin from './admin';
import comment from './comment';

const router = Router();

// Global API routes that does not require elevated permissions
mountApiRoute(router, 'get', '/categories/:cid?', [], controllers.api.category.get);
mountApiRoute(router, 'get', '/categories/:cid/tags/:name', [], controllers.api.category.tags.getByName);

router.use('/blog', blog);
router.use('/comment', comment);
router.use('/user', user);
router.use('/admin', requireAuthentication, verifyAdministrator, applyAdminFlag, admin);

function applyAdminFlag(req: Request, res: Response, next: NextFunction) {
    res.locals.isAdminRoute = true;
    next();
}

export default router;