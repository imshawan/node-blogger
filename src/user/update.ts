import { IUser, MutableObject } from "@src/types";
import {utils as Utils} from './utils';
import { password as Passwords, getISOTimestamp, generateUUID } from "@src/utilities";
import _ from "lodash";
import { database } from "@src/database";
import { get as geApplicationInfo } from "@src/application";

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
            await database.updateObjects({_key: 'user', userid: Number(userid)}, {$set: payload});
        }
    }
}

function validateUserData(userData: IUser): boolean {
    const {fullname, bio, about} = userData;

    if (fullname) {
        if (fullname.length > Number(geApplicationInfo('maxFullnameLength'))) {
            throw new Error('fullname too large');
        }
        if (fullname.length < Number(geApplicationInfo('minFullnameLength'))) {
            throw new Error('fullname too small');
        }
    }

    if (bio) {
        if (bio.length > Number(geApplicationInfo('maxBioLength'))) {
            throw new Error('bio too large');
        }
        if (bio.length < Number(geApplicationInfo('minBioLength'))) {
            throw new Error('bio too small');
        }
    }

    if (about) {
        if (about.length > Number(geApplicationInfo('maxAboutLength'))) {
            throw new Error('about too large');
        }
        if (about.length < Number(geApplicationInfo('minAboutLength'))) {
            throw new Error('about too small');
        }
    }

    return true;
}