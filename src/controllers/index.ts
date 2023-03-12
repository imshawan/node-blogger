import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { Request, Response } from 'express';

async function home(req: Request, res: Response) {
  res.render('index');
  // return res.status(HttpStatusCodes.OK).json({message: 'string'});
}

export default {
  home,
} as const;