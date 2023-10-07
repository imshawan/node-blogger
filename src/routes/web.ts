import express, { Request, Response, Router } from 'express';
import controllers from '../controllers';
import path from 'path';
import { paths } from '@src/constants';
import { WebManifest } from '@src/helpers';

const router = Router();

router.use('/worker.js', express.static(path.join(paths.assetsDir, 'scripts', 'worker.js')));
router.get('/manifest.json', async function (req: Request, res: Response) {
    const manifest = new WebManifest().get();
    return res.json(manifest)
});

export default router;