import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { NextFunction, Request, Response } from 'express';

const get = async function (req: Request, res: Response, next: NextFunction) {
  res.render('blog/index');
}

export default {
    get,
  } as const;