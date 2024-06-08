import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { handleApiResponse, handleRateLimiting } from '@src/helpers';
import { initializeCors, corsWithOptions, requireLogin, notFoundHandler } from '@src/middlewares';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { breadcrumbs } from '@src/middlewares';
import apiRouter from './api';
import pageRouter from './pageRoutes';
import authentication from './authentication';
import adminPageRouter from './admin';
import userRoutes from './user';
import webAppConfiguration from './web';

const router = Router();
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: handleRateLimiting
});

router.options('/*', corsWithOptions, (req: Request, res: Response) => { res.sendStatus(HttpStatusCodes.OK); })

// Mounting the page routers
router.use('/', initializeCors, pageRouter);
router.use('/', initializeCors, authentication);

// Handlers for contains configurations related to other various aspects of the web application
router.use('/', webAppConfiguration);

// Mounting the admin page routers
router.use('/admin', initializeCors, requireLogin.bind(null, '/admin'), breadcrumbs.bind(null, '/admin'), adminPageRouter);

router.use('/users', initializeCors, breadcrumbs.bind(null, '/users'), userRoutes);

// Mounting the API router along with rate limiting
router.use('/api/', limiter);
router.use('/api/v1', initializeCors, apiRouter);

// 404 handling for APIs
router.use('/api/*', (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.NOT_FOUND, res);
});

// 404 handling for normal routes
router.use('/*', notFoundHandler);

export default router;