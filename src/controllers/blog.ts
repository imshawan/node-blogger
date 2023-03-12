import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { NextFunction, Request, Response } from 'express';

const get = async function (req: Request, res: Response, next: NextFunction) {
  res.render('index');
  // return res.status(HttpStatusCodes.OK).json({message: 'string'});
}

export default {
    get,
  } as const;