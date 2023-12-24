import SMTPConnection from 'nodemailer/lib/smtp-connection';
import services from "nodemailer/lib/well-known/services.json"

export type Security = undefined | 'NONE' | 'ENCRYPTED' | 'STARTTLS';

export type SMTPService = keyof typeof services | 'custom';

export interface ISender {
    host?: string | undefined;
    port?: number | undefined;
    security?: Security;
    pool?: boolean | undefined;
    service?: SMTPService;
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

export interface ICustomSMTPService {
    name: string
    host: string
    port: number
    security: string
    username: string
    password: string
}