import { Request } from "express";
import {database} from "@src/database";
import { IApplication, MulterFilesArray, MutableObject, ValueOf } from "@src/types";
import { application, getCommonFields, 
    set as updateConfigurationStore, setValuesBulk, getTypeofField } from "@src/application";
import email from "./email";
import { initializeEmailClient } from "@src/email/emailer";

const validSiteImagesArray = ['logo', 'favicon'] as const;

type ValidSiteImageTypes = typeof validSiteImagesArray[number];

const updateCommonStore = async (req: Request) => {
    const body = parseBoolean(req.body);
    const fieldsFromRequest = Object.keys(body) as (keyof IApplication)[];
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
        if (expectedType !== 'undefined' && typeof body[field] != expectedType) {
            throw new Error(`Invalid type supplied for ${field}. Expected ${expectedType} but found ${typeof req.body[field]}`);
        }
    });

    fieldsFromRequest.forEach(field => applicationData[field] = body[field]);
    if (Object.keys(applicationData).length) {
        await database.updateObjects(_key, applicationData);
        setValuesBulk(applicationData);

        await reinitializeEmailClientOnConfigChange(applicationData);
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

        await database.updateObjects(_key, {[imageType]: url})
        updateConfigurationStore(imageType, url);
    }
    
    return {message: application.configurationStore};
}

const reinitializeEmailClientOnConfigChange = async (data: MutableObject) => {
    const keysFromApplicationData = Object.keys(data) as (keyof IApplication)[];
    const SMTPServiceFields = [
        "emailService",
        "emailServicePassword",
        "emailServiceUsername"
    ] as (keyof IApplication)[];

    let serviceKeysMatch = 0;

    keysFromApplicationData.forEach(elem => (SMTPServiceFields.includes(elem) && serviceKeysMatch++));

    if (Boolean(serviceKeysMatch)) {
        await initializeEmailClient();
    }
}

function parseBoolean(data: MutableObject={}) {
    const booleanValues = ['true', 'false'];

    Object.keys(data).forEach(field => {
        const value = data[field];
        if (typeof value == 'string' && booleanValues.includes(String(value).trim())) {
            data[field] = JSON.parse(String(data[field]).trim().toLowerCase());
        }
    });

    return data;
}

export default {
    updateSiteImages, updateCommonStore, email
  } as const;