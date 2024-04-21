import { database } from "@src/database";
import {utils as UserUtils} from './utils'
import { IRoles, ISortedSetKey, IUser, IUserMetrics, ValidSortingTechniquesTypes } from "@src/types";
import { filterObjectByKeys, sanitizeString } from "@src/utilities";
import { ValidSortingTechniques } from "@src/constants";
import _ from "lodash";

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
    "website",
    "roles",
    "joiningDate",
    "lastOnline",
  ] as (keyof IUser)[];

interface IUserOptions {
    perPage?: number; 
    page?: number; 
    fields?: string[]; sorting?: ValidSortingTechniquesTypes
    withMetrics?: boolean;
}

export async function getUsers(options: IUserOptions = {}) {
    let {page, perPage, fields, sorting, withMetrics} = options ?? {};
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
    } else if (!fields || !fields.length) {
        fields = validUserFields;
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

    let users = await database.getObjectsBulk(userSets, fields);
    if (withMetrics) {
        const metrics = await UserUtils.getUserMetrics(users.map(({userid}) => Number(userid)));
        const metricsMap = UserUtils.createMetricsMap(metrics);

        users.forEach((user) => {
            let metrics = metricsMap.get(Number(user.userid));
            return  _.merge(user, UserUtils.serializeMetrics(metrics ?? {}));
        });
    }

    return {users, total: total ?? 0};
}

export async function getUserByUsername(username: string, fields?: (keyof IUser)[], withMetrics: boolean = false): Promise<IUser | null> {
    if (!username) {
        throw new Error('username is required');
    }
    if (fields && !Array.isArray(fields)) {
        throw new TypeError('fields must be an array, found ' + typeof fields);
    } else if (!fields || !fields.length) {
        fields = validUserFields;
    }

    let sets = await database.fetchSortedSetsRangeReverse('user:username:' + sanitizeString(username), 0, -1); 
    let set; 

    if (!sets.length) {
        return null;
    } else {
        set = sets[0];
    }

    const data = await database.getObjects(set, fields) as IUser;

    if (withMetrics) {
        let metrics = await UserUtils.getUserMetrics([Number(data.userid)]);
        return _.merge(data, UserUtils.serializeMetrics(metrics.length ? metrics[0] : {}));
    }

    return data;
}

export async function getUserByEmail(email: string, withMetrics: boolean = false): Promise<IUser | null> {
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

    let data = await database.getObjects(String(set.value), validUserFields) as IUser;
    if (!data) {
        return null;
    }

    if (withMetrics) {
        let metrics = await UserUtils.getUserMetrics([Number(data.userid)]);
        return _.merge(data, UserUtils.serializeMetrics(metrics.length ? metrics[0] : {}));
    }

    return data;
}

export async function getUserByUserId(userid: number=0, withMetrics: boolean = false): Promise<IUser> {
    if (!userid) {
        throw new Error('Userid is required');
    }

    if (userid < 1) {
        throw new Error('Invalid userid supplied');
    }

    const user = await database.getObjects('user:' + userid, validUserFields);

    if (withMetrics) {
        let metrics = await UserUtils.getUserMetrics([Number(user.userid)]);
        return _.merge(user, UserUtils.serializeMetrics(metrics.length ? metrics[0] : {}));
    }

    return user;
}

export async function getUserWIthFields(userid: number=0, fields: string[]=[], withMetrics: boolean = false) {
    if (!userid) {
        throw new Error('Userid is required');
    }

    if (userid < 1) {
        throw new Error('Invalid userid supplied');
    }
    if (!fields || !fields.length) {
        fields = validUserFields;
    }
    if (!Array.isArray(fields)) {
        fields = validUserFields;
    }
    if (!fields.includes('userid')) {
        fields.push('userid');
    }

    const user = await database.getObjects('user:' + userid, fields);

    if (withMetrics) {
        let metrics = await UserUtils.getUserMetrics([Number(user.userid)]);
        return _.merge(user, UserUtils.serializeMetrics(metrics.length ? metrics[0] : {}));
    }

    return user;
}

export async function isAdministrator(userid: number | IUser): Promise<boolean> {
    // TODo
    // Logic to be implemented

    var user: IUser;

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