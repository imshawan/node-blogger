import { Router, Request, Response, NextFunction } from 'express';
import { hasAdministratorAccess, routeHelper } from '@src/middlewares';
import categories from './categories';
import users from './users';
import controllers from '@src/controllers';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';

const router = Router();

router.use(function (req: Request, res: Response, next: NextFunction) {
    res.locals.isAdminRoute = true;
    next();
});

router.use('/categories', categories);
router.use('/users', users);
router.use('/dashboard', hasAdministratorAccess, controllers.administrator.admin.get);

router.use('/', async function (req: Request, res: Response) {
    if (req.path == '/') {
        return res.redirect('/admin/dashboard');
    } else {
        return res.status(HttpStatusCodes.NOT_FOUND).render('404')
    }
})

export default router;