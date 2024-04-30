/*
 * Copyright (C) 2024 Shawan Mandal <hello@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import services from "nodemailer/lib/well-known/services.json";
import SMTPConnection from 'nodemailer/lib/smtp-connection';
import { Sender } from "./sender";
import {get as getValueByField} from '@src/application';
import { SMTPService, Security } from "@src/types";
import { Logger } from "@src/utilities";
import Handlebars from 'handlebars';
import * as Helpers from "@src/helpers";

const logger = new Logger();

export const emailer: {sendMail: Function, transport?: Transporter<any> | null | undefined} = {
    sendMail: function (email: Mail.Options) {}
};

export const getWellknownServices = (): string[] => Object.keys(services);

export const initializeEmailClient = async () => {
    const service = getValueByField('emailService') as SMTPService;
    const host = getValueByField('emailServiceHost');
    const port = getValueByField('emailServicePort');
    const security = getValueByField('emailServiceSecurity') as Security;
    const pooling = getValueByField('emailServicePooling');

    const auth = {
        user: String(getValueByField('emailServiceUsername')),
        pass: String(getValueByField('emailServicePassword')),
    } as SMTPConnection.Credentials;

    if (emailer.transport && Object.hasOwnProperty.bind(emailer.transport)('close')) {
        if (typeof emailer.transport.close === 'function') {
            emailer.transport.close();
        }
    }

    const sender = new Sender({
        service: service,
        host: String(host),
        port: Number(port),
        security: security,
        auth: auth,
        pool: Boolean(pooling),
    });

    try {
        await sender.initialize();

        emailer.sendMail = sender.sendMail;
        emailer.transport = sender.getSMTPTransport();
        logger.info('Email client initialized');
        
    } catch (err) {
        logger.error('Skipping email client setup as error occured while initialization:', err.message);
    }
}

export const compileAndBindTemplate = (html: string, dataBindings?: object) => {
    if (!html) {
        return '';
    }
    if (!dataBindings || !Object.keys(dataBindings).length) {
        dataBindings = {};
    }

    const isHtmlValid = Helpers.isValidHtml(html);
    if (!isHtmlValid) {
        throw new Error('Invalid HTML template');
    }

    let compiledHtml = '';
    try {
        let temlateFn = Handlebars.compile(html);
        compiledHtml = temlateFn(dataBindings);
    } catch (err) {
        logger.error('Error while rendering email template.');
    }

    return compiledHtml;
}