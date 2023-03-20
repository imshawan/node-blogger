import { Request } from "express";
import {database} from "@src/database";

const get = async (req: Request) => {
    return {message: 'Ok, working fine.'};
}

export default {
    get,
  } as const;