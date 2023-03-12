import { Request } from "express";

const get = async (req: Request) => {
    return {message: 'Ok, working fine.'};
}

export default {
    get,
  } as const;