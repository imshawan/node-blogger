import { Request, Response } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import { utils } from "@src/user";
import { IUserRegisteration } from "@src/types";

const signIn = async (req: Request, res: Response) => {
    console.log(req.body);
    
    handleApiResponse(HttpStatusCodes.OK, res, {});
}

const register = async (req: Request, res: Response) => {
    const userData: IUserRegisteration = req.body;
    let {username, email, password, confirmpassword} = userData;

    if (utils.isValidEmail(email)) {
        throw new Error('Invalid email id');
    }
    
    utils.validatePassword(password)
    
    
    // res.redirect('register?complete=true');
    // handleApiResponse(HttpStatusCodes.OK, res, {});
}

export default {
    signIn, register
  } as const;