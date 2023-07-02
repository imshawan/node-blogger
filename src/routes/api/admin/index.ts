import { Router } from 'express';
import category from './category';

const router = Router();

router.use('/categories', category);

export default router;