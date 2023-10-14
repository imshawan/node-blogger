import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";



export default {
    
    updateSiteLogo: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.category.get(req));
    }

} as const