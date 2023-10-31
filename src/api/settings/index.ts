import { Request } from "express";
import {database} from "@src/database";
import { MulterFilesArray, ValueOf } from "@src/types";
import { application, set as updateConfigurationStore } from "@src/application";

const validSiteImagesArray = ['logo', 'favicon'] as const;

type ValidSiteImageTypes = typeof validSiteImagesArray[number];

const updateSiteImages = async (req: Request, imageType: ValidSiteImageTypes) => {
    if (!imageType) {
        throw new Error('Image type is required.');
    }
    if (!validSiteImagesArray.includes(imageType)) {
        throw new Error('Invalid image type. Valid image types are: ' + validSiteImagesArray.join(', '))
    }

    const _key = 'global:application';
    const files = req.files as MulterFilesArray[];

    if (files.length) {
        let {url, mimetype} = files[0];

        // TODO: Implement mimetype/filetype validation

        await database.updateObjects({_key}, {$set: {[imageType]: url}})
        updateConfigurationStore(imageType, url);
    }
    
    return {message: application.configurationStore};
}

export default {
    updateSiteImages,
  } as const;