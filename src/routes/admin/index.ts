import { Router, Request, Response, NextFunction } from 'express';
import categories from './categories';

const router = Router();

router.use(function (req: Request, res: Response, next: NextFunction) {
    res.locals.isAdminRoute = true;
    next();
});

router.use('/categories', categories);

export default router;