import { database } from "@src/database";
import {utils as UserUtils} from './utils'
import { IRoles, ISortedSetKey, IUser, ValidSortingTechniquesTypes } from "@src/types";
import { filterObjectByKeys, sanitizeString } from "@src/utilities";
import { ValidSortingTechniques } from "@src/constants";

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
    "lastOnline",
    "followers"
  ] as (keyof IUser)[];

interface IUserOptions {
    perPage?: number; 
    page?: number; 
    fields?: string[]; sorting?: ValidSortingTechniquesTypes
}

export async function getUsers(options: IUserOptions = {}) {
    let {page, perPage, fields, sorting} = options ?? {};
    if (!perPage) {
        perPage=15;
    }
    if (!page) {
        page = 1;
    }
    if (isNaN(perPage) || isNaN(page)) {
        throw new TypeError('perPage and page must be a numbers');
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields) {
        fields = [];
    }
    if (!sorting) {
        sorting = String(ValidSortingTechniques.DEFAULT) as ValidSortingTechniquesTypes;
    }

    let start = (page - 1) * perPage,
        stop = perPage + start;

    const [userSets, total] = await Promise.all([
        database.fetchSortedSetsRangeReverse('user:userid', start, stop),
        database.getObjectsCount('user:userid')
    ]);

    let users = await database.getObjectsBulk(userSets, validUserFields);
    users = users.map(UserUtils.serialize);

    return {users, total: total ?? 0};
}

export async function getUserByUsername(username: string): Promise<IUser | null> {
    if (!username) {
        throw new Error('username is required');
    }

    let sets = await database.fetchSortedSetsRangeReverse('user:username:' + sanitizeString(username), 0, -1); 
    let set; 

    if (!sets.length) {
        return null;
    } else {
        set = sets[0];
    }

    let data = database.getObjects(set, validUserFields) as IUser;

    return UserUtils.serialize(data);
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

    return UserUtils.serialize(data);
}

export async function getUserByUserId(userid: number=0): Promise<IUser> {
    if (!userid) {
        throw new Error('Userid is required');
    }

    if (userid < 1) {
        throw new Error('Invalid userid supplied');
    }

    const user = await database.getObjects('user:' + userid, validUserFields);

    return UserUtils.serialize(user);
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

    const user = await database.getObjects('user:' + userid, fields);

    return UserUtils.serialize(user);
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

    if (Object.hasOwnProperty.bind(user)('roles') && user.roles) {
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