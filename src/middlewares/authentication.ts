import { NextFunction, Response, Request } from 'express';
import { database } from "@src/database";
import { utils as UserUtils, validUserFields } from '@src/user';
import {user as UserMiddleware} from './user';
import { IUser } from '@src/types/user';


const loginUser = async function loginUser (req: Request, u: string, e: string, done: Function) {
    const {username, password} = req.body;
    if (!username) {
        throw new Error('username/email is required to validate a user');
    }
    if (!password || !password.length) {
        throw new Error('Password is required to login');
    }

    // TODO: Need to validate for max password length in future

    const searchkeys = {
        _scheme: 'user:userid',
        // If it's a valid email, check agains't the email or else use username to check
        [UserUtils.isValidEmail(username) ? 'email' : 'username']: username,
    };

    const user: IUser = await database.getObjects(searchkeys);
    if (!user) {
        return done(new Error('could not find any user associated with such credentials'));
    }

    if (!user.userid || !user.passwordHash) {
        return done(new Error('Something went wrong while creating your account, please re-try registeration'));
    }
    
    const isPasswordCorrect = await UserMiddleware.comparePassword(user.userid, password);
    if (!isPasswordCorrect) {
        return done(new Error('Invalid credentials, please try again'));
    }

    const userObject: IUser = {};
    validUserFields.forEach(field => {
        if (user.hasOwnProperty(field)) {
            // @ts-ignore
            userObject[field] = user[field];
        }
    }); 

    return done(null, userObject, {message: 'Authentication successful'});
}

const authentication = {
    loginUser
}

export {authentication};