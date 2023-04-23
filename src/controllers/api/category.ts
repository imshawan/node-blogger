import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";

const create = async (req: Request, res: Response, next: NextFunction) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.category.create(req));
}

export default {
    create,
  } as const;