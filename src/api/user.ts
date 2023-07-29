import { Request } from "express";
import {database} from "@src/database"
import { getUserByUsername, utils, updateUserData, isAdministrator } from "@src/user";
import { MutableObject, MulterFilesArray, ExpressUser } from "@src/types";

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
    const {userid} = req.params;
    return
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

export default {
    checkUsername, checkPassword, updateUser, updatePicture
  } as const;