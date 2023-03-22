import { Router } from 'express';
import blog from './blog';
import user from './user';

const router = Router();

router.use('/blog', blog);
router.use('/user', user);

export default router;