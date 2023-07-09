import { log } from 'console';
import { NextFunction, Response, Request, Application } from 'express';

export const routeHelper = async function ( req: Request, res: Response, next: NextFunction) {
      log('req.path', req.path)

    next();
}