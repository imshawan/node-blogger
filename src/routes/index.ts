import { Router, Request, Response } from 'express';
import { handleApiResponse } from '@src/helpers';
import { corsWithOptions } from '@src/middlewares';
import apiRouter from './api/blog';
import pageRouter from './pageRoutes';

const router = Router();

router.options('/*', corsWithOptions, (req, res) => { res.sendStatus(200); })

router.use('/', pageRouter);
router.use('/api/v1', apiRouter);

// 404 handling
router.use('/*', (req: Request, res: Response) => {
    handleApiResponse(404, res);
});

export default router;