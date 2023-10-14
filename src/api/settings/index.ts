import { Request } from "express";
import {database} from "@src/database";
import { MulterFilesArray } from "@src/types";

const updateSiteLogo = async (req: Request) => {
    const files = req.files as MulterFilesArray[];
    let logoUrl = ''

    if (files.length) {
        logoUrl = files[0].url;
    }
    
    return {message: logoUrl};
}

export default {
    updateSiteLogo,
  } as const;