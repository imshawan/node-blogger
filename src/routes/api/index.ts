import { Router, Request, Response, NextFunction } from 'express';
import { requireAuthentication, verifyAdministrator } from '@src/middlewares';
import blog from './blog';
import user from './user';
import admin from './admin';

const router = Router();

router.use('/blog', blog);
router.use('/user', user);
router.use('/admin', requireAuthentication, verifyAdministrator, applyAdminFlag, admin);

function applyAdminFlag(req: Request, res: Response, next: NextFunction) {
    res.locals.isAdminRoute = true;
    next();
}

export default router;