import { Router, Request, Response } from 'express';
import { handleApiResponse } from '@src/helpers';
import { initializeCors, corsWithOptions } from '@src/middlewares';
import apiRouter from './api/blog';
import pageRouter from './pageRoutes';

const router = Router();

router.options('/*', corsWithOptions, (req: Request, res: Response) => { res.sendStatus(200); })

router.use('/', initializeCors, pageRouter);
router.use('/api/v1', initializeCors, apiRouter);

// 404 handling
router.use('/*', (req: Request, res: Response) => {
    handleApiResponse(404, res);
});

export default router;