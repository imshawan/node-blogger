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

const deleteUser = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.deleteUser(req));
}

const updatePicture = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.updatePicture(req));
}

const consent = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.consent(req));
}

const follow = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.followUser(req));
}

const unFollow = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.user.unFollowUser(req));
}

export default {
    checkUsername, checkPassword, update, updatePicture, consent, deleteUser, follow, unFollow
  } as const;