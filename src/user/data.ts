import { database } from "@src/database";
import {utils as UserUtils} from './utils'
import { IRoles, IUser } from "@src/types";

export const validUserFields = [
    "userid",
    "fullname",
    "slug",
    "username",
    "email",
    "birthday",
    "picture",
    "cover",
    "location",
    "bio",
    "about",
    "roles",
    "joiningDate",
    "lastOnline"
  ];

export async function getUsersByPagination(options={}) {
    //TODO need to implement pagination

    return await database.getObjects({_key: 'user'}, validUserFields, {multi: true});
}

export async function getUserByUsername(username: string): Promise<IUser> {
    if (!username) {
        throw new Error('username is required');
    }

    return await database.getObjects({username, _key: 'user'}, validUserFields);   
}

export async function getUserByEmail(email: string): Promise<IUser> {
    if (!email || !email.length) {
        throw new Error('An email-id is required');
    }

    if (!UserUtils.isValidEmail(email)) {
        throw new Error('Invalid email id');
    }

    return await database.getObjects({email, _key: 'user'}, validUserFields);
}

export async function getUserByUserId(userid: number): Promise<IUser> {
    if (!userid) {
        throw new Error('Userid is required');
    }

    if (userid < 1) {
        throw new Error('Invalid userid supplied');
    }

    return await database.getObjects({userid, _key: 'user'}, validUserFields);
}

export async function isAdministrator(userid: number | object): Promise<boolean> {
    // TODo
    // Logic to be implemented

    var user: any;

    if (typeof userid == 'object') {
        user = userid;
    } else {
        user = await getUserByUserId(userid);
    }

    if (Object.hasOwnProperty.bind(user)('roles')) {
        const roles: IRoles = user.roles;

        if (Object.hasOwnProperty.bind(roles)('administrator')) {
            return Boolean(Number(roles.administrator));
        }
    }

    return false;
}

export async function getUserRoles(userid: number): Promise<Array<string>> {
    const userRoles: Array<string> = [];
    const user = await getUserByUserId(userid);

    if (Object.hasOwnProperty.bind(user)('roles')) {
        const roles: any = user.roles;

        for (const key in roles) {
            if (Object.prototype.hasOwnProperty.call(roles, key)) {
                if (Boolean(Number(roles[key]))) {
                    userRoles.push(key);
                }
            }
        }
    }

    return userRoles;
}