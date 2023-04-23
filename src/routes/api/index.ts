import { Router } from 'express';
import blog from './blog';
import user from './user';
import category from './category';

const router = Router();

router.use('/blog', blog);
router.use('/user', user);
router.use('/category', category);

export default router;