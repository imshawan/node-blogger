import { Request } from "express";
import {database} from "@src/database";
import { MulterFilesArray, ValueOf } from "@src/types";
import { meta, set as updateConfigurationStore } from "@src/meta";

const validSiteImagesArray = ['logo', 'favicon'] as const;

type ValidSiteImageTypes = typeof validSiteImagesArray[number];

const updateSiteImages = async (req: Request, imageType: ValidSiteImageTypes) => {
    if (!imageType) {
        throw new Error('Image type is required.');
    }
    if (!validSiteImagesArray.includes(imageType)) {
        throw new Error('Invalid image type. Valid image types are: ' + validSiteImagesArray.join(', '))
    }

    const _key = 'global:meta';
    const files = req.files as MulterFilesArray[];

    if (files.length) {
        let {url, mimetype} = files[0];

        // TODO: Implement mimetype/filetype validation

        await database.updateObjects({_key}, {$set: {[imageType]: url}})
        updateConfigurationStore(imageType, url);
    }
    
    return {message: meta.configurationStore};
}

export default {
    updateSiteImages,
  } as const;