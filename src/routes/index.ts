import { Router, Request, Response } from 'express';
import { handleApiResponse } from '@src/helpers';
import { initializeCors, corsWithOptions, requireLogin, notFoundHandler } from '@src/middlewares';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { breadcrumbs } from '@src/middlewares';
import apiRouter from './api';
import pageRouter from './pageRoutes';
import authentication from './authentication';
import adminPageRouter from './admin';
import userRoutes from './user';

const router = Router();

router.options('/*', corsWithOptions, (req: Request, res: Response) => { res.sendStatus(HttpStatusCodes.OK); })

// Mounting the page routers
router.use('/', initializeCors, pageRouter);
router.use('/', initializeCors, authentication);

// Mounting the admin page routers
router.use('/admin', initializeCors, requireLogin.bind(null, '/admin'), breadcrumbs.bind(null, '/admin'), adminPageRouter);

router.use('/users', initializeCors, breadcrumbs.bind(null, '/users'), userRoutes);

// Mounting the API router
router.use('/api/v1', initializeCors, apiRouter);

// 404 handling for APIs
router.use('/api/*', (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.NOT_FOUND, res);
});

// 404 handling for normal routes
router.use('/*', notFoundHandler);

export default router;