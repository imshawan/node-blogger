import { IUser, MutableObject } from "@src/types";
import {utils as Utils} from './utils';
import { password as Passwords, getISOTimestamp, generateUUID, sanitizeString } from "@src/utilities";
import _ from "lodash";
import { database } from "@src/database";
import { get as getApplicationInfo } from "@src/application";

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

export async function changeUsername(data: {username: string; password: string; userid: number;}) {
    const {username, password, userid} = data;
    const key = 'user:' + userid;

    if (!username || !password || !userid) {
        throw new Error('username, password and userid are required');
    }
    if (typeof password !== 'string' || typeof username !== 'string') {
        throw new Error(`password and username must be a string found ${typeof password} and ${typeof username} instead`);
    }

    await Utils.validateUsername(username);
    const isValid = await Utils.isValidUserPassword(userid, password);
    if (!isValid) {
        throw new Error('Invalid password');
    }
    
    const writeData = {
        username,
        updatedAt: getISOTimestamp(),
    }
    const bulkRemoveSets = [
        ['user:username:' + sanitizeString(username), key],
        ['user:username', String(sanitizeString(username)).toLowerCase() + ':' + userid]
    ]
    await Promise.all([
        database.updateObjects('user:' + userid, writeData),
        database.sortedSetRemoveKeys(bulkRemoveSets),
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