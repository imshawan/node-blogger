import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { database } from '@src/database';
import { NextFunction, Request, Response } from 'express';
import { notFoundHandler } from '@src/middlewares';
import { NavigationManager } from '@src/utilities/navigation';
import { utils as UserUtilities } from '@src/user';
import { IGoogleUser, ISortedSetKey } from '@src/types';
import _ from 'lodash';
import { OAuth, IOAuth } from '@src/helpers';
import * as User from '@src/user';;

const signIn = async function (req: Request, res: Response) {
    const {redirect} = req.query;
    const navigation = new NavigationManager().get();

    const page = {
        title: 'Sign in',
        redirect,
        navigation,
        oauth: OAuth.getProviders(),
    };

    res.render('signin', page);
}

const oAuthSignin = async function (req: Request, res: Response) {
    const service = req.params.service as IOAuth['Providers'];

    if (!OAuth.getProviderNames().includes(service)) {
        return notFoundHandler(req, res);
    }

    const url = await OAuth.getAuthUrl(service);

    res.redirect(String(url));
}

const handleOAuthLogins = async function (req: Request, res: Response, next: NextFunction) {
    const user = req.user as IGoogleUser;
    let {email, name: fullname, picture} = user;

    let userData = await User.getUserByEmail(email);
    let username = userData?.username;

    if (!userData) {
        username = await User.utils.generateUsernameOrSlug(fullname);
        let {token, ...usr} = await User.register({...user, fullname, username});

        userData = usr;
    }

    // Also update the picture if it has changed
    picture = picture ?? '';
    if (picture != userData.picture) {
        await User.updateUserData(Number(userData.userid), {picture});
    }

    req.logIn(userData, async function(err) {
        if (err) { return next(err); }

        const consent: any = await UserUtilities.hasCompletedConsent(Number(userData?.userid));
        if (consent && !consent.consentCompleted) {
            const {token} = consent;
            return res.redirect(`/register/complete?token=${token}`);
        }

        return res.redirect('/');
    });
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
    const {token} = req.params;
    const invalidLinkError = new Error('The link is invalid or might have been expired, please try again later');

    const decoded = UserUtilities.decodeToken(token);
    if (!decoded || !Object.keys(decoded).length) {
        throw invalidLinkError;
    }

    const userid = decoded.userid;
    const secretExists = await database.getSortedSetValue('user:' + userid + ':reset', new RegExp('^' + _.escapeRegExp(token) + ':*')) as ISortedSetKey;
    if (!secretExists) {
        throw invalidLinkError;
    }

    const secret = String(secretExists.value).split(':')
    const jwtPayload = UserUtilities.validatePasswordResetToken(token, secret.length > 1 ? secret[1] : '');
    if (!jwtPayload) {
        throw invalidLinkError;
    }

    const page = {
        title: 'Reset password',
        navigation: new NavigationManager().get(),
    };

    res.render('set_password', page);
}

export default {
    signIn, register, consent, resetPassword, validateTokenAndSecret, oAuthSignin, handleOAuthLogins
  } as const;