import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import services from "nodemailer/lib/well-known/services.json";
import SMTPConnection from 'nodemailer/lib/smtp-connection';
import { Sender } from "./sender";
import {get as getValueByField} from '@src/application';
import { SMTPService, Security } from "@src/types";
import { Logger } from "@src/utilities";

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