import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { Request, Response } from 'express';

const signIn = async function (req: Request, res: Response) {
    const page = {
        title: 'Sign in'
    };

    res.render('signin', page);
}

const register = async function (req: Request, res: Response) {
    const page = {
        title: 'Register'
    };

    res.render('register', page);
}

export default {
    signIn, register
  } as const;