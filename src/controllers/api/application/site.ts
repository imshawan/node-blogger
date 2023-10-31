import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";



export default {
    
    updateLogo: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.application.updateSiteImages(req, 'logo'));
    },

    updateFavicon: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.application.updateSiteImages(req, 'favicon'));
    }

} as const