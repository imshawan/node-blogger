import { Router, Request, Response, NextFunction } from 'express';
import { hasAdministratorAccess, routeHelper } from '@src/middlewares';
import manage from './manage';
import categories from './categories';
import users from './users';
import settings from './settings';
import advancedAdminSettings from './advanced';
import controllers from '@src/controllers';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';

const router = Router();

router.use(function (req: Request, res: Response, next: NextFunction) {
    res.locals.isAdminRoute = true;
    next();
});

router.use('/manage/categories', hasAdministratorAccess, categories);
router.use('/manage', hasAdministratorAccess, manage);
router.use('/dashboard', hasAdministratorAccess, controllers.administrator.admin.get);
router.use('/settings', hasAdministratorAccess, settings);
router.use('/advanced', hasAdministratorAccess, advancedAdminSettings);

router.use('/', async function (req: Request, res: Response) {
    if (req.path == '/') {
        return res.redirect('/admin/dashboard');
    } else {
        res.locals.error = true;
        return res.status(HttpStatusCodes.NOT_FOUND).render('404', {title: '404'})
    }
})

export default router;