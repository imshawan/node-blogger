import { Request } from "express";
import {Sender, template as Template, setupCustomSMTPService} from "@src/email";
import * as Helpers from "@src/helpers";
import { IEmailTemplate } from "@src/types";
import { sanitizeHtml } from "@src/utilities";
import { isAdministrator } from "@src/user";

const getTemplates = async (req: Request) => {
    const {query} = req;
    const id = Number(req.params.id);

    if (id) {
        return await Template.getById(id);
    }

    let perPage = Number(query.perPage);
    let page = Number(query.page);
    let url = [req.baseUrl, req.url].join('');
    let {search, field} = req.query;

    if (!perPage) {
        perPage = 15;
    }
    if (isNaN(page) || !page) {
        page = 1;
    }

    // TODO: Implement other methods for querying the templates with pagination support
}

const createTemplate = async (req: Request) => {
    const {name, html} = req.body;
    const userid = Helpers.parseUserId(req);
    const writeData: IEmailTemplate = {};

    writeData.name = String(name).trim();
    writeData.html = sanitizeHtml(html);

    const template = await Template.create(writeData, Number(userid));
    return template;
}

const updateTemplate = async (req: Request) => {
    const id = Number(req.params.id);
    const userid = Helpers.parseUserId(req);
    const {name, html} = req.body;
    
    if (isNaN(id)) {
        throw new Error('Invalid template id');
    }

    const writeData: IEmailTemplate = {};

    if (name) {
        writeData.name = name.trim();
    }
    if (html) {
        writeData.html = sanitizeHtml(html);
    }

    if (Object.keys(writeData).length) {
        return await Template.update(writeData, id, Number(userid));
    }

    return writeData;
}

const deleteTemplate = async (req: Request) => {
    const id = Number(req.params.id);
    const userid = Helpers.parseUserId(req);

    if (isNaN(id)) {
        throw new Error('Invalid is supplied.');
    }

    await Template.removeById(id, userid);
}

const pushEmailByTemplateId = async (req: Request) => {
    const id = Number(req.params.id);
    const userid = Helpers.parseUserId(req);

    if (!await isAdministrator(userid)) {
        throw new Error('This operation requires admin privilages.');
    }

    const templateData = await Template.getById(id);
    if (!templateData) {
        throw new Error('No such template with the supplied id');
    }

    const {html} = templateData;
    if (!html || !html.length) {
        throw new Error('The template is empty, nothing to send');
    }

    const isHtmlValid = Helpers.isValidHtml(html);
    if (!isHtmlValid) {
        throw new Error('Sending failed. Found some issues with the template.')
    }

    // TODO: Implement email sending functionality using appropriate service provider
}

const setupSMTPService = async (req: Request) => {
    const userid = Helpers.parseUserId(req);

    if (!await isAdministrator(userid)) {
        throw new Error('This operation requires admin privilages.');
    }

    return await setupCustomSMTPService(req.body, userid);
}

export default {
    createTemplate, updateTemplate, getTemplates, deleteTemplate, pushEmailByTemplateId, setupSMTPService,
} as const