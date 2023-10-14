import { Router } from 'express';
import category from './category';
import settings from './settings';

const router = Router();

router.use('/categories', category);
router.use('/settings', settings);

export default router;