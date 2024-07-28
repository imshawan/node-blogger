import { NextFunction, Response, Request } from 'express';
import { database } from "@src/database";
import { password as Passwords } from "@src/utilities";
import { getUserByUserId } from '@src/user';
import locales from '@src/locales';
import { ValidationError, ValueError } from '@src/helpers/errors';

const serializeUser = async function serializeUser(user: any, done: Function) {    
    done(null, user.userid);
}

const deserializeUser = async function deserializeUser(id: any, done: Function) {
    try {
        const user = await getUserByUserId(id);
        if (user) {
            done(null, user)
        } else done(new Error(locales.translate('user:no_user_found')), {})
    } catch (err) {
        done(err, {});
    }
}

const comparePassword = async function comparePassword(userid: number, password: string) {
    if (userid < 1) {
        throw new ValueError(locales.translate('api-errors:invalid_field', {field: 'userid'}));
    }

    if (!password) {
        throw new ValidationError(locales.translate('api-errors:is_required', {field: 'password'}));
    }

    const user = await database.getObjects('user:' + userid, ['passwordHash']);
    if (!user) {
        throw new Error(locales.translate('user:no_user_found'));
    }

    const {passwordHash} = user;
    const comparison = await Passwords.compare({hash: passwordHash, password});
    return comparison;
}

const user = {
    serializeUser, deserializeUser, comparePassword
}

export {user};