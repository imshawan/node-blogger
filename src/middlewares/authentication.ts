import { NextFunction, Response, Request } from 'express';
import { database } from "@src/database";
import { utils as UserUtils, validUserFields } from '@src/user';
import {user as UserMiddleware} from './user';
import { IUser } from '@src/types/user';
import { sanitizeString } from '@src/utilities';
import { ISortedSetKey, MutableObject } from '@src/types';


const loginUser = async function loginUser (req: Request, u: string, e: string, done: Function) {
    const {username, password} = req.body;
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

    return done(null, userObject, {message: 'Authentication successful'});
}

const authentication = {
    loginUser
}

export {authentication};