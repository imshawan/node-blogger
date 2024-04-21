import { IUser, MutableObject } from "@src/types";
import {utils as Utils} from './utils';
import { password as Passwords, getISOTimestamp, generateUUID, sanitizeString } from "@src/utilities";
import _ from "lodash";
import { database } from "@src/database";
import { get as getApplicationInfo } from "@src/application";
import { isAdministrator } from "./data";

const validUserFields = [
    "fullname",
    "birthday",
    "picture",
    "cover",
    "location",
    "bio",
    "about",
  ];

export async function updateUserData(userid: number, userData: IUser) {
    const payload: MutableObject = {};

    if (validateUserData(userData)) {
        const timestamp = getISOTimestamp();

        validUserFields.forEach(field => {
            if (Object.hasOwnProperty.bind(userData)(field)) {
                // @ts-ignore
                payload[field] = userData[field];
            }
        });

        if (Object.keys(payload)) {
            payload.updatedAt = timestamp;
            await database.updateObjects('user:' + userid, payload);
        }
    }
}

export async function changeUsername(data: {username: string; password: string; userid: number;}, caller: number) {
    const {username, password, userid} = data;
    const key = 'user:' + userid;
    const now = Date.now();

    if (!username || !password || !userid || caller) {
        throw new Error('username, password, userid and caller are required');
    }
    if (typeof caller !== 'number') {
        throw new Error(`caller must be a number found ${typeof caller} instead`);
    }
    if (typeof password !== 'string' || typeof username !== 'string') {
        throw new Error(`password and username must be a string found ${typeof password} and ${typeof username} instead`);
    }

    const user = await database.getObjects('user:' + userid, ['passwordHash', 'roles', 'userid']) as IUser;
    if (!user) {
        throw new Error('User not found');
    }
    if (Number(user.userid) !== Number(caller)) {
        let isAdmin = await isAdministrator(user);
        if (!isAdmin) {
            throw new Error('You are not authorized to perform this action');
        }
    }

    await Utils.validateUsername(username);

    const isValid = await Utils.isValidUserPassword(user, password);
    if (!isValid) {
        throw new Error('Invalid password');
    }
    
    const writeData = {
        username,
        updatedAt: getISOTimestamp(),
    }
    const bulkRemoveSets = [
        ['user:username:' + sanitizeString(user.username ?? ''), key],
        ['user:username', String(sanitizeString(user.username ?? '')).toLowerCase() + ':' + userid]
    ], bulkAddSets = [
        ['user:username:' + sanitizeString(username), key, now],
        ['user:username', String(sanitizeString(username)).toLowerCase() + ':' + userid, now]
    ];

    await Promise.all([
        database.updateObjects('user:' + userid, writeData),
        database.sortedSetRemoveKeys(bulkRemoveSets),
        database.sortedSetAddKeys(bulkAddSets),
    ]);
}

function validateUserData(userData: IUser): boolean {
    const {fullname, bio, about} = userData;

    if (fullname) {
        if (fullname.length > Number(getApplicationInfo('maxFullnameLength'))) {
            throw new Error('fullname too large');
        }
        if (fullname.length < Number(getApplicationInfo('minFullnameLength'))) {
            throw new Error('fullname too small');
        }
    }

    if (bio) {
        if (bio.length > Number(getApplicationInfo('maxBioLength'))) {
            throw new Error('bio too large');
        }
        if (bio.length < Number(getApplicationInfo('minBioLength'))) {
            throw new Error('bio too small');
        }
    }

    if (about) {
        if (about.length > Number(getApplicationInfo('maxAboutLength'))) {
            throw new Error('about too large');
        }
        if (about.length < Number(getApplicationInfo('minAboutLength'))) {
            throw new Error('about too small');
        }
    }

    return true;
}