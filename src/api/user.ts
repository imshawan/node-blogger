import { Request } from "express";
import {database} from "@src/database"
import { getUserByUsername, utils } from "@src/user";

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

export default {
    checkUsername, checkPassword,
  } as const;