import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";
import { MutableObject } from "@src/types";

const categoryControllers: MutableObject = {
    tags: {}
};

categoryControllers.get = async (req: Request, res: Response, next: NextFunction) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.category.get(req));
}

categoryControllers.create = async (req: Request, res: Response, next: NextFunction) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.category.create(req));
}

categoryControllers.edit = async (req: Request, res: Response, next: NextFunction) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.category.edit(req));
}

categoryControllers.delete = async (req: Request, res: Response, next: NextFunction) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.category.delete(req));
}

/**
 * @description Controllers for the tags management for categories specifically
 */

categoryControllers.tags.create = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.category.tags.create(req));
}

categoryControllers.tags.remove = async (req: Request, res: Response) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.category.tags.remove(req));
}


export default categoryControllers;