import { database } from "@src/database";
import {utils as UserUtils} from './utils'

export const validUserFields = [
    "userid",
    "firstname",
    "lastname",
    "slug",
    "username",
    "email",
    "birthday",
    "picture",
    "location",
    "bio",
    "about",
  ];

export async function getUserByUsername(username: string) {
    if (!username) {
        throw new Error('username is required');
    }

    return await database.getObjects({username, _key: 'user'}, validUserFields);   
}

export async function getUserByEmail(email: string) {
    if (!email || !email.length) {
        throw new Error('An email-id is required');
    }

    if (!UserUtils.isValidEmail(email)) {
        throw new Error('Invalid email id');
    }

    return await database.getObjects({email, _key: 'user'}, validUserFields);
}

export async function getUserByUserId(userid: number) {
    if (!userid) {
        throw new Error('Userid is required');
    }

    if (userid < 1) {
        throw new Error('Invalid userid supplied');
    }

    return await database.getObjects({userid, _key: 'user'}, validUserFields);
}

export async function isAdministrator(userid: number) {
    // TODo
    // Logic to be implemented

    const user = await getUserByUserId(userid);

    return true;
}