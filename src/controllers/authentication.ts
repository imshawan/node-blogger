import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { database } from '@src/database';
import { Request, Response } from 'express';
import { notFoundHandler } from '@src/middlewares';
import { NavigationManager } from '@src/utilities/navigation';
import { utils as UserUtilities } from '@src/user';

const signIn = async function (req: Request, res: Response) {
    const {redirect} = req.query;
    const navigation = new NavigationManager().get();

    const page = {
        title: 'Sign in',
        redirect,
        navigation,
    };

    res.render('signin', page);
}

const consent = async function (req: Request, res: Response) {
    const {token} = req.query;
    // @ts-ignore
    const userid = req.user.userid;
    const consentData = await database.getObjects('user:' + userid + ':registeration');
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
        consent: consentData,
        navigation: new NavigationManager().get(),
    };

    res.render('consent', page);
}

const register = async function (req: Request, res: Response) {
    const page = {
        title: 'Register',
        navigation: new NavigationManager().get(),
    };

    res.render('register', page);
}

const resetPassword = async function (req: Request, res: Response) {
    const page = {
        title: 'Reset password',
        navigation: new NavigationManager().get(),
    };

    res.render('reset_password', page);
}

const validateTokenAndSecret = async function (req: Request, res: Response) {
    const {secret} = req.query;
    const {token} = req.params;

    const jwtPayload = UserUtilities.validatePasswordResetToken(token, String(secret));
    if (!jwtPayload) {
        throw new Error('The link is invalid or might have been expired, please try again later');
    }

    const page = {
        title: 'Reset password',
        navigation: new NavigationManager().get(),
    };

    res.render('reset_password', page);
}

export default {
    signIn, register, consent, resetPassword, validateTokenAndSecret
  } as const;