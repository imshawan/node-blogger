/*
 * Copyright (C) 2024 Shawan Mandal <github@imshawan.dev>.
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

/**
 * @date 24-12-2023
 * @author imshawan <github@imshawan.dev>
 * 
 * @class Sender
 * @description Manages the setup and sending of emails using an SMTP transport service through Nodemailer.
 */
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

        this.sendMail = this.sendMail.bind(this);
    }

    /**
     * Parses and configures security options based on the provided SMTP security setting.
     * @returns Configured security options for the SMTP transporter.
     */
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

    /**
     * Initializes the SMTP transporter based on the provided configuration.
     */
    public async initialize() {
        if (!this.transporterOptions) {
            this.transporterOptions = {};
        }

        if (this.service) {
            if (!Object.hasOwnProperty.bind(this.auth)("user")) {
                throw new ValueError('Missing property: "user" from auth');
            }
            if (!Object.hasOwnProperty.bind(this.auth)("pass")) {
                throw new ValueError('Missing property: "pass" from auth');
            }
            
            if (String(this.service).toLowerCase() == "custom") {
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
                this.transporterOptions.auth = this.auth;
            }
        }

        const transporter = nodemailer.createTransport(this.transporterOptions);
        await transporter.verify();

        this.transporter = transporter;
    }

    /**
     * Retrieves the available security options for SMTP connections.
     * @returns Object containing available security options.
     */
    public static getSecurityOptions() {
        return validScurityOptions;
    }

    /**
     * Checks if the SMTP transporter is initialized and ready for sending emails.
     * @returns Boolean indicating the readiness of the SMTP transporter.
     */
    public isReady() {
        return Boolean(this.transporter);
    }

    /**
     * Retrieves the configured SMTP transporter instance.
     * @returns The SMTP transporter instance or null if not initialized.
     */
    public getSMTPTransport() {
        return this.transporter;
    }

    /**
     * Sends an email using the configured SMTP transporter.
     * @param email - Email message object to be sent.
     * @throws Error if transporter is not properly initialized or required properties are missing in the email object.
     */
    public async sendMail(email: Mail.Options) {
        if (!this.transporter) {
            throw new Error(
                "SMTP Transport was not initialized properly, please re-initialize."
            );
        }
        if (!email.from) {
            throw new ValueError('"from" is a required property.');
        }
        if (!email.to) {
            throw new ValueError('"to" is a required property.');
        }
        if (!email.subject) {
            throw new ValueError('"subject" is a required property.');
        }
        if (!email.html && !email.text) {
            throw new Error(
                'Nothing to send as "text" and "html" both are null.'
            );
        }

        await this.transporter.sendMail(email);
    }
}