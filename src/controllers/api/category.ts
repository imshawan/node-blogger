import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";
import { MutableObject } from "@src/types";

const categoryControllers: MutableObject = {};

categoryControllers.create = async (req: Request, res: Response, next: NextFunction) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.category.create(req));
}

categoryControllers.edit = async (req: Request, res: Response, next: NextFunction) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.category.edit(req));
}

categoryControllers.delete = async (req: Request, res: Response, next: NextFunction) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.category.delete(req));
}

export default categoryControllers;