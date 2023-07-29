import { IUser } from "@src/types";
import {utils as Utils} from './utils';
import { password as Passwords, getISOTimestamp, generateUUID } from "@src/utilities";
import _ from "lodash";
import { database } from "@src/database";

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
    var {gdprConsent, acceptedTnC} = userdata;

    Utils.validatePassword(password);
    Utils.isValidEmail(email)
    await Promise.all([
        Utils.checkEmailAvailability(email),
        Utils.validateUsername(username)
    ])

    const user: IUser = {
        _key: 'user'
    };

    const [passwordHash, slug, userid] = await Promise.all([
        Passwords.hash({password, rounds: 12}),
        Utils.generateUserslug(username),
        Utils.generateNextUserId(),
    ]);

    user.userid = userid;
    userFields.forEach(field => {
        // @ts-ignore
        if (userdata[field]) {
            // @ts-ignore
            user[field] = userdata[field] || '';
        }
    });

    user.slug = slug;
    user.passwordHash = passwordHash;
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
    const newUserRegData = {
        _key: 'user:' + userid + ':registeration',
        token: uniqueUUID,
        consentStage: false,
        userid: userid,
        createdAt: timestamp,
    };

    const [data] = await Promise.all([
        database.setObjects(user),
        database.setObjects(newUserRegData),
    ])
    return _.merge(data, {token: uniqueUUID});
}