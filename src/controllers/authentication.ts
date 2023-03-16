import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { Request, Response } from 'express';

const signIn = async function (req: Request, res: Response) {
    const page = {
        title: 'Sign in'
    };

    res.render('signin', page);
}

export default {
    signIn,
  } as const;