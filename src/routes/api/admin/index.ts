import { Router } from 'express';
import category from './category';
import application from './application';

const router = Router();

router.use('/categories', category);
router.use('/application', application);

export default router;