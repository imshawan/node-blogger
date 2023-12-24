import SMTPConnection from 'nodemailer/lib/smtp-connection';


export type Security = undefined | 'NONE' | 'ENCRYPTED' | 'STARTTLS';

export interface ISender {
    host?: string | undefined;
    port?: number | undefined;
    security?: Security;
    pool?: boolean | undefined;
    service?: string | undefined;
    auth?: SMTPConnection.Credentials;
    transporterOptions?: ISMTPTransporterOptions
}

export interface IEmailTemplate {
    _id?: string
    _key?: string
    templateId?: number
    name?: string
    slug?: string
    html?: string
    createdAt?: string
    updatedAt?: string
}

export interface ISMTPTransporterOptions extends SMTPConnection.Options {
    pool?: boolean | undefined;
    service?: string | undefined
}