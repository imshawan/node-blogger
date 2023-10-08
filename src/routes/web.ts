import express, { Request, Response, Router } from 'express';
import controllers from '../controllers';
import path from 'path';
import { paths } from '@src/constants';
import { WebManifest } from '@src/helpers';

const router = Router();

router.use('/worker.js', express.static(path.join(paths.assetsDir, 'scripts', 'worker.js')));
router.get('/manifest.json', controllers.web.manifest);
router.get('/robots.txt', controllers.web.robots);
router.get('/sitemap.xml', controllers.web.sitemap);

export default router;