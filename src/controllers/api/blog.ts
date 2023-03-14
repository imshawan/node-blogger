import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";

const get = async (req: Request, res: Response, next: NextFunction) => {
    handleApiResponse(HttpStatusCodes.OK, res, await api.blog.get(req));
}

export default {
    get,
  } as const;