import { Request } from "express";
import {database} from "@src/database";
import { IApplication, MulterFilesArray, MutableObject, ValueOf } from "@src/types";
import { application, getCommonFields, 
    set as updateConfigurationStore, setValuesBulk, getTypeofField } from "@src/application";
import email from "./email";

const validSiteImagesArray = ['logo', 'favicon'] as const;

type ValidSiteImageTypes = typeof validSiteImagesArray[number];

const updateCommonStore = async (req: Request) => {
    const fieldsFromRequest = Object.keys(req.body) as (keyof IApplication)[];
    const commonApplicationFields = getCommonFields();
    const invalidFields: (keyof IApplication)[] = [];
    const applicationData: MutableObject = {};
    const _key = 'global:application';

    fieldsFromRequest.forEach(field => !commonApplicationFields.includes(field) && invalidFields.push(field));
    if (invalidFields.length) {
        throw new Error('Invalid store field(s) were found in the request: ' + invalidFields.join(', '));
    }

    fieldsFromRequest.forEach(field => {
        const expectedType = getTypeofField(field)
        if (typeof req.body[field] != expectedType) {
            throw new Error(`Invalid type supplied for ${field}. Expected ${expectedType} but found ${typeof req.body[field]}`);
        }
    });

    fieldsFromRequest.forEach(field => applicationData[field] = req.body[field]);
    if (Object.keys(applicationData).length) {
        await database.updateObjects({_key}, {$set: applicationData});
        setValuesBulk(applicationData);
    }

    return applicationData;
}

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
    updateSiteImages, updateCommonStore, email
  } as const;