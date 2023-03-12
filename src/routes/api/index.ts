import { Router } from 'express';
import blog from './blog';

const router = Router();

router.use('/blog', blog);

export default router;