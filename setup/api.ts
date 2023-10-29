import express, {Request, Response, NextFunction} from 'express';
import server from './server';

const router = express.Router();

router.post('/database', database);
router.post('/account', setupAdministrator);
router.post('/complete', complete);

async function database(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({message: 'OK'})
}

async function setupAdministrator(req: Request, res: Response, next: NextFunction) {
    const {body} = req;
    res.status(200).json({message: 'Username too short.', field: 'username'})
}

async function complete(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({message: 'OK'})
}

export default router;
