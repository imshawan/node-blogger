import express, { Router } from 'express';
import controllers from '../controllers';
import path from 'path';
import { paths } from '@src/constants';

const router = Router();

router.use('/worker.js', express.static(path.join(paths.assetsDir, 'scripts', 'worker.js')));

export default router;