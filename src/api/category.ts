import { Request } from "express";
import {database} from "@src/database";

const create = async (req: Request) => {
    console.log(req.body);
    
    return {message: 'Ok, working fine.'};
}

export default {
    create,
  } as const;