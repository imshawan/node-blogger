import nodemailer, { SentMessageInfo, Transporter } from "nodemailer";
import SMTPConnection from "nodemailer/lib/smtp-connection";
import services from "nodemailer/lib/well-known/services.json"
import { ISMTPTransporterOptions, Security, ISender, SMTPService } from "@src/types";
import { ValueError } from "@src/helpers";
import Mail from "nodemailer/lib/mailer";
import _ from "lodash";

const validScurityOptions = {
    NONE: 'None',
    STARTTLS: 'StartTLS',
    ENCRYPTED: 'Encrypted'
};

export class Sender {
    private readonly host?: string | undefined;
    private readonly port?: number | undefined;
    private readonly security?: Security;
    private readonly pool?: boolean | undefined;
    private readonly service?: SMTPService;
    private readonly services?: Array<string>;
    private readonly auth?: SMTPConnection.Credentials;

    private transporterOptions?: ISMTPTransporterOptions;
    private transporter: Transporter<SentMessageInfo> | null;

    constructor(options: ISender) {
        this.host = options.host;
        this.port = Number(options.port);
        this.security = options.security;
        this.pool = Boolean(options.pool);
        this.service = options.service as SMTPService;
        this.auth = options.auth;
        this.transporterOptions = options.transporterOptions || {};
        this.transporter = null;
        this.services = Object.keys(services);
    }

    private parseSecurityOptions() {
        if (!this.security) return {};

        switch (this.security) {
            case "NONE":
                return {
                    secure: false,
                    requireTLS: false,
                    ignoreTLS: true,
                };

            case "ENCRYPTED":
            case undefined:
                return {
                    secure: true,
                    requireTLS: true,
                    ignoreTLS: false,
                };

            case "STARTTLS":
                return {
                    secure: false,
                    requireTLS: true,
                    ignoreTLS: false,
                };

            default:
                return {
                    secure: false,
                    requireTLS: false,
                    ignoreTLS: true,
                };
        }
    }

    public async initialize() {
        if (!this.transporterOptions) {
            this.transporterOptions = {};
        }

        if (this.service) {
            if (String(this.service).toLowerCase() == "custom") {
                if (!Object.hasOwnProperty.bind(this.auth)("user")) {
                    throw new ValueError('Missing property: "user" from auth');
                }
                if (!Object.hasOwnProperty.bind(this.auth)("pass")) {
                    throw new ValueError('Missing property: "pass" from auth');
                }
                if (!this.port || isNaN(this.port)) {
                    throw new ValueError("Incorrect value for port");
                }

                this.transporterOptions = _.merge(
                    this.transporterOptions,
                    this.parseSecurityOptions()
                );
                this.transporterOptions.host = this.host;
                this.transporterOptions.port = this.port;
                this.transporterOptions.auth = this.auth;
                this.transporterOptions.pool = Boolean(this.pool);
            } else {
                this.transporterOptions.service = this.service;
            }
        }

        const transporter = nodemailer.createTransport(this.transporterOptions);
        await transporter.verify();

        this.transporter = transporter;
    }

    public static getSecurityOptions() {
        return validScurityOptions;
    }

    public isReady() {
        return Boolean(this.transporter);
    }

    public async sendMail(email: Mail.Options) {
        if (!this.transporter) {
            throw new Error(
                "SMTP Transport was not initialized properly, please re-initialize."
            );
        }
        if (!email.from) {
            throw new ValueError('"from" is a required property.');
        }
        if (!email.subject) {
            throw new ValueError('"subject" is a required property.');
        }
        if (!email.from) {
            throw new ValueError('"from" is a required property.');
        }
        if (!email.html || !email.text) {
            throw new Error(
                'Nothing to send as "text" and "html" both are null.'
            );
        }
        if (!email.sender) {
            email.sender = email.from;
        }

        await this.transporter.sendMail(email);
    }
}