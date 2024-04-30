import { NextFunction, Request, Response } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import { utils as UserUtilities, register as RegisterUser, getUserByEmail } from "@src/user";
import { IUserRegisteration } from "@src/types";
import passport from "passport";
import { renderError } from "@src/middlewares";

const signIn = async (req: Request, res: Response, next: NextFunction) => {
    var {redirect} = req.body;

    passport.authenticate('local', async function (err?: Error, userData?: any, info?: object) {
        if (err) {
            return handleApiResponse(HttpStatusCodes.UNAUTHORIZED, res, new Error(err.message));
        }

        if (req.body.rememberme) {
            // TODO
        }
        
        req.logIn(userData, async function(err) {
            if (err) { return next(err); }

            const consent: any = await UserUtilities.hasCompletedConsent(userData.userid);
            if (consent && !consent.consentCompleted) {
                const {token} = consent;
                return res.json({next: `register/complete?token=${token}`, user: userData});
            }

            return res.json({next: redirect || '/', user: userData});
        });
    })(req, res, next);
}

const signout = async (req: Request, res: Response) => {
    req.logOut((err) => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
}

const register = async (req: Request, res: Response) => {
    const userData: IUserRegisteration = req.body;
    let {username, email, password, confirmpassword} = userData;

    UserUtilities.validatePassword(password);
    await UserUtilities.validateUsername(username);
    await UserUtilities.checkEmailAvailability(email);

    if (!UserUtilities.isValidEmail(email)) {
        throw new Error('Invalid email id');
    }
    if (password != confirmpassword) {
        throw new Error('Passwords do not match');
    }
    
    const data = await RegisterUser(userData);

    // TODO introduce the token mechanism for consents (per user)
    handleApiResponse(HttpStatusCodes.OK, res, {
        next: `${req.url}/complete?token=${data.token}`, token: data.token,
        userid: data.userid
    });
}

const resetPassword = async function (req: Request, res: Response) {
    const {email} = req.body;
    const pageData = {
        title: 'Reset email sent',
        email
    }

    try {
        if (!UserUtilities.isValidEmail(email)) {
            throw new Error('Invalid email id supplied');
        }

        const user = await getUserByEmail(email);
        if (!user) {
            return res.render('reset_email_sent', pageData);
        }

        await UserUtilities.sendPasswordResetEmail(req, user);

    } catch (error) {
        return renderError(req, res, error);
    }

    res.render('reset_email_sent', pageData);
}

export default {
    signIn, register, signout, resetPassword
  } as const;