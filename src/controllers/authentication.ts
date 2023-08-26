import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { database } from '@src/database';
import { Request, Response } from 'express';
import { notFoundHandler } from '@src/middlewares';

const signIn = async function (req: Request, res: Response) {
    const {redirect} = req.query;
    const page = {
        title: 'Sign in',
        redirect,
    };

    res.render('signin', page);
}

const consent = async function (req: Request, res: Response) {
    const {token} = req.query;
    // @ts-ignore
    const userid = req.user.userid;
    const consentData = await database.getObjects({_key: 'user:' + userid + ':registeration'});
    if (!consentData) {
        return notFoundHandler(req, res);
    }

    if (consentData && consentData.consentCompleted) {
        return notFoundHandler(req, res);
    }

    if (consentData && consentData.token != token) {
        return notFoundHandler(req, res);
    }

    const page = {
        title: 'consent',
        token,
        consent: consentData
    };

    res.render('consent', page);
}

const register = async function (req: Request, res: Response) {
    const page = {
        title: 'Register'
    };

    res.render('register', page);
}

export default {
    signIn, register, consent
  } as const;