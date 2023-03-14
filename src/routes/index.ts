import { Router, Request, Response } from 'express';
import { handleApiResponse } from '@src/helpers';
import { initializeCors, corsWithOptions } from '@src/middlewares';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import apiRouter from './api/blog';
import pageRouter from './pageRoutes';

const router = Router();

router.options('/*', corsWithOptions, (req: Request, res: Response) => { res.sendStatus(HttpStatusCodes.OK); })

router.use('/', initializeCors, pageRouter);
router.use('/api/v1', initializeCors, apiRouter);

// 404 handling for APIs
router.use('/api/*', (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.NOT_FOUND, res);
});

// 404 handling for normal routes
router.use('/*', (req: Request, res: Response) => {
    res.status(HttpStatusCodes.NOT_FOUND).render('404')
});

export default router;