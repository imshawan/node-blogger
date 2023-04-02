import { NextFunction, Response, Request } from 'express';
import { database } from "@src/database";
import { password as Passwords } from "@src/utilities";

const serializeUser = async function serializeUser(user: any, done: Function) {
    done(null, user._id);
}

const deserializeUser = async function deserializeUser(id: any, done: Function) {
    try {
        const user = await database.getObjects({_id: id});
        if (user) {
            done(null, user)
        } else done(new Error('Count not find user'), {})
    } catch (err) {
        done(err, {});
    }
}

const comparePassword = async function comparePassword(userid: number, password: string) {
    if (userid < 1) {
        throw new Error('Invalid user id');
    }

    if (!password) {
        throw new Error('A valid password is required to validate against');
    }

    const user = await database.getObjects({userid}, ['passwordHash']);
    if (!user) {
        throw new Error('No user found with the supplied id');
    }

    const {passwordHash} = user;
    const comparison = await Passwords.compare({hash: passwordHash, password});
    return comparison;
}

const user = {
    serializeUser, deserializeUser, comparePassword
}

export {user};