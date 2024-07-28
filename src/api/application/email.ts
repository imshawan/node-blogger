import { Request } from "express";
import {Sender, template as Template, setupCustomSMTPService} from "@src/email";
import * as Helpers from "@src/helpers";
import { ExpressUser, IEmailTemplate } from "@src/types";
import { sanitizeHtml, types } from "@src/utilities";
import { isAdministrator } from "@src/user";
import { initializeEmailClient, emailer, compileAndBindTemplate } from "@src/email/emailer";
import Mail from "nodemailer/lib/mailer";
import { get as getValueByField } from "@src/application";
import locales from "@src/locales";
import { PermissionError } from "@src/helpers/errors";

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
    const {name, html, canDelete, defaults} = req.body;
    const userid = Helpers.parseUserId(req);
    const writeData: IEmailTemplate = {};

    writeData.name = String(name).trim();
    writeData.html = sanitizeHtml(html);

    if (types.isBoolean(canDelete)) {
        writeData.canDelete = canDelete;
    }

    if (types.object.isNotEmpty(defaults)) {
        writeData.defaults = defaults;
    }

    const template = await Template.create(writeData, Number(userid));
    return template;
}

const updateTemplate = async (req: Request) => {
    const id = Number(req.params.id);
    const userid = Helpers.parseUserId(req);
    const {name, html} = req.body;
    
    if (isNaN(id)) {
        throw new Error(locales.translate('api-errors:invalid_type', {field: 'id', expected: 'number', got: typeof id}));
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
        throw new Error(locales.translate('api-errors:invalid_type', {field: 'id', expected: 'number', got: typeof id}));
    }

    await Template.removeById(id, userid);
}

const pushEmailByTemplateId = async (req: Request) => {
    const id = Number(req.params.id);
    const userid = Helpers.parseUserId(req);
    const user = req.user as ExpressUser;
    const from = String(getValueByField('applicationEmail'));
    const fromName = String(getValueByField('applicationEmailFromName'));

    if (!await isAdministrator(userid)) {
        throw new PermissionError(locales.translate('api-errors:require_admin_privilege'));
    }

    const templateData = await Template.getById(id);
    if (!templateData) {
        throw new Error(locales.translate('api-errors:entity_not_found', {entity: 'template'}));
    }

    const {html, name} = templateData;
    if (!html || !html.length) {
        throw new Error(locales.translate('api-errors:empty_email_template'));
    }

    const isHtmlValid = Helpers.isValidHtml(html);
    if (!isHtmlValid) {
        throw new Error(locales.translate('api-errors:bad_email_template'));
    }

    if (!from) {
        throw new Error(locales.translate('api-errors:app_email_not_configured'));
    }

    const compiledHtml = compileAndBindTemplate(html);
    if (!compiledHtml) {
        throw new Error(locales.translate('api-errors:error_email_send_template'));
    }

    const emailMessage: Mail.Options = {
        from,
        to: String(user.email),
        subject: name + ' - ' + locales.translate('api-common:testing'),
        html: compiledHtml,
    };

    await emailer.sendMail(emailMessage);
}

const setupSMTPService = async (req: Request) => {
    const userid = Helpers.parseUserId(req);

    if (!await isAdministrator(userid)) {
        throw new PermissionError(locales.translate('api-errors:require_admin_privilege'));
    }

    const service = await setupCustomSMTPService(req.body, userid);
    await initializeEmailClient();

    return service;
}

export default {
    createTemplate, updateTemplate, getTemplates, deleteTemplate, pushEmailByTemplateId, setupSMTPService,
} as const