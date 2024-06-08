import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";

export default {
    create: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.comment.create(req));
    }, 

    get: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.comment.get(req));
    }, 

    remove: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.comment.remove(req));
    }, 
}