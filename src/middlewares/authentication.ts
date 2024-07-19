import { NextFunction, Response, Request } from 'express';
import axios from 'axios';
import { database } from "@src/database";
import { utils as UserUtils, validUserFields } from '@src/user';
import { user as UserMiddleware } from './user';
import { IUser } from '@src/types/user';
import { sanitizeString } from '@src/utilities';
import { ISortedSetKey, MutableObject, IGoogleUser } from '@src/types';
import { OAuth as OAuthHelpers, IOAuth } from '@src/helpers';
import { notFoundHandler } from '.';
import { OAuth as OAuthConst } from '@src/constants';


const loginUser = async function loginUser(req: Request, u: string, e: string, done: Function) {
    const { username, password } = req.body;
    if (!username) {
        throw new Error('username/email is required to validate a user');
    }
    if (!password || !password.length) {
        throw new Error('Password is required to login');
    }

    // TODO: Need to validate for max password length in future

    // If it's a valid email, check agains't the email or else use username to check
    const authMethod = UserUtils.isValidEmail(username) ? 'email' : 'username' as keyof IUser;
    const key = 'user:' + authMethod + ':' + sanitizeString(username);
    const set: ISortedSetKey = await database.getObjects(key);

    if (!set) {
        return done(new Error('Could not find any user associated with such credentials'));
    }

    const user: IUser = await database.getObjects(String(set.value));
    if (!user || !Object.keys(user).length) {
        return done(new Error('Could not find any user associated with such credentials'));
    }

    if (!user.userid || !user.passwordHash) {
        return done(new Error('Something went wrong while you were creating your account, please re-try registering.'));
    }

    if (user[authMethod] != username) {
        return done(new Error('Invalid credentials, please try again'));
    }

    const isPasswordCorrect = await UserMiddleware.comparePassword(user.userid, password);
    if (!isPasswordCorrect) {
        return done(new Error('Invalid credentials, please try again'));
    }

    const userObject: MutableObject = {};
    validUserFields.forEach((field) => {
        if (user.hasOwnProperty(field)) {
            if (user[field]) {
                userObject[field] = user[field];
            } else {
                userObject[field] = null;
            }
        }
    });

    return done(null, userObject, { message: 'Authentication successful' });
}

const validateOAuthRedirectionCallback = async function (req: Request, res: Response, next: NextFunction) {
    const service = req.params.service as IOAuth['Providers'];

    if (!service || !OAuthHelpers.getProviderNames().includes(service)) {
        return notFoundHandler(req, res);
    }

    await OAuthVerifyCallbacks[service](service, req, res, next);
}

const OAuthVerifyCallbacks = {
    async google(service: IOAuth['Providers'], req: Request, res: Response, next: NextFunction) {
        const { code, scope, authuser, prompt } = req.query;
        const { clientId, clientSecret, redirectUrl } = OAuthHelpers.getProviderConfig(service);
        try {
            const { data } = await axios.post(OAuthConst.Google.Token, {
                client_id: clientId,
                client_secret: clientSecret,
                code,
                scope,
                grant_type: OAuthConst.Google.GrantType,
                redirect_uri: redirectUrl
            });

            let { access_token, id_token } = data;

            const { data: profile } = await axios.get<IGoogleUser>(OAuthConst.Google.UserInfo, {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            req.user = profile;

            next();

        } catch (err) {
            return notFoundHandler(req, res);
        }
    }
}

const authentication = {
    loginUser, OAuthVerifyCallbacks, validateOAuthRedirectionCallback
}

export { authentication };