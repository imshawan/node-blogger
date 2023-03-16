import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";

const signIn = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    
    handleApiResponse(HttpStatusCodes.OK, res, {});
}

const register = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    
    res.redirect('register?complete=true');
    // handleApiResponse(HttpStatusCodes.OK, res, {});
}

export default {
    signIn, register
  } as const;