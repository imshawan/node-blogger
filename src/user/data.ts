import { database } from "@src/database";
import {utils as UserUtils} from './utils'
import { IRoles, ISortedSetKey, IUser } from "@src/types";
import { filterObjectByKeys, sanitizeString } from "@src/utilities";

export const validAccessUserRoles = ['administrator', 'globalModerator'];
export const validUserFields: (keyof IUser)[] = [
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
  ] as (keyof IUser)[];

export async function getUsersByPagination(options={}) {
    //TODO need to implement pagination

    return await database.getObjects('user:userid', validUserFields, {multi: true});
}

export async function getUserByUsername(username: string): Promise<IUser | null> {
    if (!username) {
        throw new Error('username is required');
    }

    let set: ISortedSetKey = await database.getSortedSetValue('user:username', sanitizeString(username));  
    if (!set) {
        return null;
    }

    let data = database.getObjects(String(set.value), validUserFields) as IUser;
    if (!data) {
        return null;
    }

    return data;
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
    if (!email || !email.length) {
        throw new Error('An email-id is required');
    }

    if (!UserUtils.isValidEmail(email)) {
        throw new Error('Invalid email id');
    }

    let set: ISortedSetKey = await database.getSortedSetValue('user:email', sanitizeString(email));  
    if (!set) {
        return null;
    }

    let data = database.getObjects(String(set.value), validUserFields) as IUser;
    if (!data) {
        return null;
    }

    return data;
}

export async function getUserByUserId(userid: number=0): Promise<IUser> {
    if (!userid) {
        throw new Error('Userid is required');
    }

    if (userid < 1) {
        throw new Error('Invalid userid supplied');
    }

    return await database.getObjects('user:' + userid, validUserFields);
}

export async function getUserWIthFields(userid: number=0, fields: string[]=[]) {
    if (!userid) {
        throw new Error('Userid is required');
    }

    if (userid < 1) {
        throw new Error('Invalid userid supplied');
    }
    if (!fields) {
        fields = validUserFields;
    }
    if (!Array.isArray(fields)) {
        fields = validUserFields;
    }
    if (!fields.includes('userid')) {
        fields.push('userid');
    }

    return await database.getObjects('user:' + userid, fields);
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