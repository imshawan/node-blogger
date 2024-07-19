import { IUser, MutableObject } from "@src/types";
import {utils as Utils} from './utils';
import { password as Passwords, getISOTimestamp, generateUUID, sanitizeString } from "@src/utilities";
import _ from "lodash";
import { database } from "@src/database";

interface IUserRegisteration extends IUser {
    token: string;
}

const userFields = [
  "userid",
  "fullname",
  "slug",
  "username",
  "email",
  "birthday",
  "picture",
  "location",
  "bio",
  "about",
];

export const register = async function register(userdata: IUser) {
    const {email='', username='', password=''} = userdata;
    const timestamp = getISOTimestamp();
    const now = Date.now();
    var {gdprConsent, acceptedTnC} = userdata;

    password && Utils.validatePassword(password);
    Utils.isValidEmail(email)
    await Promise.all([
        Utils.checkEmailAvailability(email),
        Utils.validateUsername(username)
    ])

    const user: IUser = {
        _scheme: 'user:userid'
    }, promises = [Utils.generateUsernameOrSlug(username), Utils.generateNextUserId()];

    if (password) {
        promises.push(Passwords.hash({password, rounds: 12}));
    }

    const [slug, userid, passwordHash] = await Promise.all(promises);
    const key = 'user:' + userid;

    user._key = key;
    user.userid = Number(userid);
    userFields.forEach(field => {
        // @ts-ignore
        if (userdata[field]) {
            // @ts-ignore
            user[field] = userdata[field] || '';
        }
    });

    user.slug = String(slug);
    user.passwordHash = String(passwordHash || '');
    user.emailConfirmed = userid === 1;

    if (gdprConsent) {
        if (typeof gdprConsent === 'string' && gdprConsent == 'true') {
            gdprConsent = true;
        }
    }

    if (acceptedTnC) {
        if (typeof acceptedTnC === 'string' && acceptedTnC == 'true') {
            acceptedTnC = true;
        }
    }

    user.gdprConsent = _.isBoolean(gdprConsent) ? gdprConsent : false;
    user.acceptedTnC = _.isBoolean(acceptedTnC) ? acceptedTnC : false;
    user.joiningDate = timestamp;
    user.isOnline = true;
    user.createdAt = timestamp;
    user.updatedAt = timestamp;

    const uniqueUUID = generateUUID();
    const registerKey = 'user:' + userid + ':registeration';
    const newUserRegData = {
        _key: registerKey,
        _scheme: 'user:userid:registeration',
        token: uniqueUUID,
        consentCompleted: false, // Flag to check if the user has completed the consent stage
        consent: {
            emails: false,
            data: false
        },
        userid: userid,
        createdAt: timestamp,
    };

    const bulkAddSets = [
        ['user:userid', key, now],
        ['user:slug:' + sanitizeString(user.slug), key, now],
        ['user:userid:' + userid, key, now],
        ['user:username:' + sanitizeString(username), key, now],
        ['user:email:' + email, key, now],
        ['user:username', String(sanitizeString(username)).toLowerCase() + ':' + userid, now],
    ];

    const [data] = await Promise.all([
        database.setObjects(key, user),
        database.setObjects(registerKey, newUserRegData),
        database.sortedSetAddKeys(bulkAddSets),
    ]);

    const filtered: MutableObject = {};
    Object.keys(data).forEach(elem => (filtered[elem] = data[elem]))

    return _.merge(filtered, {token: uniqueUUID}) as IUserRegisteration;
}