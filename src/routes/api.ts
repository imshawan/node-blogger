import { Router } from 'express';
import controllers from '../controllers';

const baseRouter = Router();

baseRouter.get('/', controllers.home);

export {baseRouter};
