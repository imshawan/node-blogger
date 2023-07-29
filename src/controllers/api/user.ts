import { Request, Response } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";

const checkUsername = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.checkUsername(req));
}

const checkPassword = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.checkPassword(req));
}

const update = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.updateUser(req));
}

const updatePicture = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.updatePicture(req));
}

export default {
    checkUsername, checkPassword, update, updatePicture
  } as const;