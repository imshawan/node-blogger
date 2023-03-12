import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import api from "@src/api";

const get = async (req: Request, res: Response, next: NextFunction) => {
    handleApiResponse(200, res, await api.blog.get(req));
}

export default {
    get,
  } as const;