import { Request, Response } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";

const checkUsername = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.checkUsername(req));
}

const checkEmail = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.checkEmail(req));
}

export default {
    checkUsername, checkEmail
  } as const;