export * as template from './template';
export * from './sender';
export * as emailer from './emailer';

import { Sender } from './sender';
import {setValuesBulk, get as getValueFromApplication} from '@src/application';
import { database } from '@src/database';
import { ICustomSMTPService, MutableObject, Security } from '@src/types';


/**
 * @author imshawan <hello@imshawan.dev>
 * @description Sets up a custom SMTP service based on provided data, updating the application's settings accordingly.
 * 
 * @param data - Object containing information about the SMTP service (host, port, name, security, username, password).
 * @param caller - Userid, identifying the caller initiating the setup.
 * @throws Error if the provided data is empty, caller is not a number, or if certain data validations fail.
 * @returns Promise that resolves to an object containing information about the configured SMTP service.
 */
export const setupCustomSMTPService = async function (data: ICustomSMTPService, caller: number) {
    if (!data || !Object.keys(data).length) {
        throw new Error('data cannot be empty.');
    }
    if (isNaN(Number(caller))) {
        throw new Error('Caller must be a number, found ' + typeof caller);
    }

    const validScurityOptions = Sender.getSecurityOptions();
    const _key = 'global:application';

    let {host, port, name, security, username, password} = data;
    let payload: MutableObject = {};

    if (isNaN(Number(port))) {
        throw new Error('port must be a number, found ' + typeof port);
    }
    if (!Object.keys(validScurityOptions).includes(security)) {
        throw new Error('Invalid value for security: ' + security);
    }

    const smtpSecurity = String(security).trim().toUpperCase() as Security;
    const authUser = String(username).trim();
    const authPass = String(password).trim();
    const enablePooling = Boolean(getValueFromApplication('emailServicePooling'));

    host = String(host).trim();
    name = String(name).trim();
    port = Number(port);

    const sender = new Sender({
        host,
        port,
        security: smtpSecurity,
        service: 'custom',
        pool: enablePooling,
        auth: {
            user: authUser,
            pass: authPass
        }
    })

    await sender.initialize();

    if (sender.isReady()) {
        payload = {
            emailService: 'custom',
            emailServiceName: name,
            emailServiceHost: host,
            emailServicePort: port,
            emailServiceSecurity: smtpSecurity,
            emailServicePooling: enablePooling,
        }

        await database.updateObjects(_key, payload);
        setValuesBulk(payload);
    }

    return payload;
}