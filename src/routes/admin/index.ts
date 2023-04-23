import { Router } from 'express';
import categories from './categories';

const router = Router();

router.use('/manage/category', categories);

export default router;