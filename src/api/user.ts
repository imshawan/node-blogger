import { Request } from "express";
import {database} from "@src/database"
import { getUserByUsername } from "@src/user";

const checkUsername = async (req: Request) => {
    const {username} = req.params;
    const user = await getUserByUsername(username);    

    if (user) {
        throw new Error('Username is already taken');
    }
}

const checkEmail = async (req: Request) => {
    
}

export default {
    checkUsername, checkEmail,
  } as const;