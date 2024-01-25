import { Request } from "express";
import {database} from "@src/database";

const get = async (req: Request) => {
    return {message: 'Ok, working fine.'};
}

const create = async (req: Request) => {
    let {title, content} = req.body;
    let tags: string[] = req.body.tags;

    if (!tags) {
        tags = [];
    }
    if (typeof tags === 'string') {
        tags = [tags];
    }
}

export default {
    get, create,
  } as const;