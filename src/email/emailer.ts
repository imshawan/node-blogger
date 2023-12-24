import { Transporter } from "nodemailer";
import services from "nodemailer/lib/well-known/services.json";
import SMTPConnection from 'nodemailer/lib/smtp-connection';
import { Sender } from "./sender";
import {get as getValueByField} from '@src/application';
import { SMTPService, Security } from "@src/types";

export const emailer: {sendMail?: Function | null | undefined, transport?: Transporter<any> | null | undefined} = {};

export const getWellknownServices = (): string[] => Object.keys(services);

export const initializeEmailClient = async () => {
    const service = getValueByField('emailService') as SMTPService;
    const host = getValueByField('emailServiceHost');
    const port = getValueByField('emailServicePort');
    const security = getValueByField('emailServiceSecurity') as Security;
    const pooling = getValueByField('emailServicePooling');

    const auth = {
        user: getValueByField('emailServiceUsername'),
        pass: getValueByField('emailServicePassword'),
    } as SMTPConnection.Credentials;

    const sender = new Sender({
        service: service,
        host: String(host),
        port: Number(port),
        security: security,
        auth: auth,
        pool: Boolean(pooling),
    });

    await sender.initialize();

    emailer.sendMail = sender.sendMail;
    emailer.transport = sender.getSMTPTransport();
}