import { Request, Response, NextFunction } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import api from "@src/api";

export default {
    get: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.blog.get(req));
    }, 

    create: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.blog.create(req));
    }, 

    like: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.blog.handleLikes(req, 'like'));
    },

    unlike: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.blog.handleLikes(req, 'unlike'));
    },
    
    getLikes: async (req: Request, res: Response, next: NextFunction) => {
        handleApiResponse(HttpStatusCodes.OK, res, await api.blog.getLikes(req));
    }
  } as const;