/*
 * Copyright (C) 2023 Shawan Mandal <github@imshawan.dev>.
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
    _scheme?: string
    templateId?: number
    name?: string
    slug?: string
    html?: string
    defaults?: object
    canDelete?: boolean
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