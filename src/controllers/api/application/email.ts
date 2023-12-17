import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";



export default {

    getTemplates: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.application.email.getTemplates(req));
    },

    createTemplate: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.application.email.createTemplate(req));
    },

    updateTemplate: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.application.email.updateTemplate(req));
    },

    deleteTemplate: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.application.email.deleteTemplate(req));
    },

    pushEmailByTemplateId: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.application.email.pushEmailByTemplateId(req));
    },

} as const