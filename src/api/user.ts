import { Request } from "express";
import {database} from "@src/database"
import { getUserByUsername, utils, updateUserData, isAdministrator, 
    deleteUser as deleteUserWithData, changeUsername as updateExistingUserUsername,
    followers as Followers, changePassword as changeExistingUserPassword,
    resetPassword as resetUserPassword} from "@src/user";
import {utils as UserUtilities} from "@src/user"
import { MutableObject, MulterFilesArray, ExpressUser, ISortedSetKey } from "@src/types";
import { parseBoolean } from "@src/utilities";
import { isAuthorizedToDelete } from "@src/permissions";
import * as Helpers from "@src/helpers";
import _ from "lodash";

const checkUsername = async (req: Request) => {
    const {username} = req.params;
    const user = await getUserByUsername(username);    

    if (user) {
        throw new Error('Username is already taken');
    }
}

const checkPassword = async (req: Request) => {
    const {password} = req.body;

    utils.validatePassword(password);
    const {suggestions, weak} = utils.checkPasswordStrength(password);

    return {suggestions, weak}
}

const updateUser = async (req: Request) => {
    let userid = Number(req.params.userid);

    const user = req.user as ExpressUser;
    const {body} = req;

    if (typeof userid !== 'number') {
        throw new Error('userid supplied must be a number');
    }

    if (user.userid != userid) {
        if (!await isAdministrator(userid)) {
            throw new Error('You are not authorized to perform this action');
        }

        // TODO: Need to put an event logger if admin updates a profile
    }

    await updateUserData(userid, body);
}

const updatePicture = async (req: Request) => {
    let userid = Number(req.params.userid);

    const user = req.user as ExpressUser;
    const files = req.files as MulterFilesArray[];
    const userData: MutableObject = {};

    if (typeof userid !== 'number') {
        throw new Error('userid supplied must be a number');
    }

    if (user.userid != userid) {
        if (!await isAdministrator(userid)) {
            throw new Error('You are not authorized to perform this action');
        }

        // TODO: Need to put an event logger if admin updates a profile
    }

    if (files && files.length) {
        files.forEach(elem => {
            const {fieldname, url} = elem;
            userData[fieldname] = url;
        });

        await updateUserData(userid, userData);
    }
    
}

const deleteUser = async (req: Request) => {
    let userid = Number(req.params.userid);

    const loggedinUser = req.user as ExpressUser;
    if (userid != loggedinUser.userid && !await isAuthorizedToDelete('user', loggedinUser.userid)) {
        throw new Error('caller requires elevated permissions for performing this operation');
    }
    
    return await deleteUserWithData(userid, loggedinUser.userid);
}

const consent = async (req: Request) => {
    const {emails, data} = req.body;
    // @ts-ignore
    const userid: Number = req.user.userid;
    const key = 'user:' + userid + ':registeration';

    const consentData = await database.getObjects(key);
    if (consentData && !consentData.consentCompleted) {
        let payload = {
            consent: {emails: parseBoolean(emails), data: parseBoolean(data)},
            consentCompleted: true
        }

        await database.updateObjects(key, payload);
    }
}

const followUser = async (req: Request) => {
    const loggedInUser = Helpers.parseUserId(req);
    const toFollow = Number(req.params.userid);

    if (!toFollow) {
        throw new Error('Invalid userid to follow');
    }

    await Followers.follow(toFollow, loggedInUser)

    return {
        message: 'Follow successful.'
    }
}

const unFollowUser = async (req: Request) => {
    const loggedInUser = Helpers.parseUserId(req);
    const toFollow = Number(req.params.userid);

    if (!toFollow) {
        throw new Error('Invalid userid to unfollow');
    }

    await Followers.unFollow(toFollow, loggedInUser);

    return {
        message: 'Unfollow successful.'
    }
}

const changeUsername = async (req: Request) => {
    const userid = Helpers.parseUserId(req);
    const {username, password} = req.body;

    await updateExistingUserUsername({userid, username, password}, userid);

    return {
        message: 'Username change successful'
    }
}

const resetPassword = async (req: Request) => {
    const {password, token} = req.body;
    const AuthorizationError = new Error('Invalid token! Please retry this process once again.');

    if (typeof password !== 'string' ||  typeof token !== 'string') {
        throw new Error(`Password and token must be a string`);
    }

    const decoded = UserUtilities.decodeToken(token);
    if (!decoded || !Object.keys(decoded).length) {
        throw AuthorizationError;
    }

    const userid = decoded.userid;
    const secretExists = await database.getSortedSetValue('user:' + userid + ':reset', new RegExp('^' + _.escapeRegExp(token) + ':*')) as ISortedSetKey;
    if (!secretExists) {
        throw AuthorizationError;
    }

    const secret = String(secretExists.value).split(':')
    const jwtPayload = UserUtilities.validatePasswordResetToken(token, secret.length > 1 ? secret[1] : '');
    if (!jwtPayload) {
        throw AuthorizationError;
    }

    await resetUserPassword(userid, password, userid);

    return {
        message: 'Password reset successful'
    };
}

const changePassword = async (req: Request) => {
    const userid = Helpers.parseUserId(req);
    const {password, oldPassword} = req.body;

    if (typeof oldPassword != 'string' || typeof password != 'string') {
        throw new Error(`Password and old password must be a string`);
    }
    if (password == oldPassword) {
        throw new Error(`New password must be different from old password`);
    }

    await changeExistingUserPassword(userid, oldPassword, password, userid);

    return {
        message: 'Password change successful'
    }
}


export default {
    checkUsername, checkPassword, updateUser, updatePicture, deleteUser, consent, followUser, unFollowUser, changeUsername,
    resetPassword, changePassword,
  } as const;