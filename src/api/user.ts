import { Request } from "express";
import {database} from "@src/database"
import { getUserByUsername, utils, updateUserData, isAdministrator, 
    deleteUser as deleteUserWithData } from "@src/user";
import { MutableObject, MulterFilesArray, ExpressUser } from "@src/types";
import { parseBoolean } from "@src/utilities";
import { isAuthorizedToDelete } from "@src/permissions";

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

export default {
    checkUsername, checkPassword, updateUser, updatePicture, deleteUser, consent
  } as const;