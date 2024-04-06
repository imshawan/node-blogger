/*
 * Copyright (C) 2023 Shawan Mandal <hello@imshawan.dev>.
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

import chalk from 'chalk';
import {stream} from '@src/helpers/logstream'

interface ILogger {
    silent?: boolean;
    prefix?: string
}

export class Logger {
    private readonly prefix?: string
    private readonly silent?: boolean
    
    constructor(options: ILogger = {}) {
        this.prefix = options.prefix;
        this.silent = options.silent ?? false;
    }

    private timeStamp() {
        return `[${new Date(Date.now()).toLocaleString()}]`;
    }

    /**
     * @date 26-11-2023
     * @returns Caller name (equivalent to arguments.callee.name)
     */
    private method() {
        let error = new Error('Error');
        let funcErrorStack = error.stack && error.stack.split('\n')[2].split(' ');
        let callerPrevIndex = funcErrorStack && funcErrorStack.indexOf('at');
        let callerName = (funcErrorStack && callerPrevIndex) && funcErrorStack[callerPrevIndex + 1];

        return callerName ? callerName.split('.')[1] :  undefined;
    }

    private color(code: string) {
        switch (code) {
            case 'error':
                return 'redBright';
            case 'warn':
                return 'yellow';
            default:
                return 'greenBright';
        }
    }

    private print(type: 'log' | 'error' | 'warn' | 'info', message: string) {
        if (!this.silent) {
            console[type](this.timeStamp(), message);
        }

        if (stream) {
            if (typeof stream[type] === 'function') {
                stream[type].call(null, message, null);
            }
        }

    }

    private parseMessage(message: Array<any>, prefix: string | undefined) {
        var parsedMessage;
        prefix = this.prefix || prefix;

        if (message && Array.isArray(message) && message.length) {
            parsedMessage = message.map(elem => {
                if (typeof elem === 'object') {
                    return JSON.stringify(elem, null, 4);
                } else return elem;
            }).join(' ');
        }
        
        return prefix ? `${chalk[this.color(prefix)](`[${this.prefix || prefix}]`)} ${parsedMessage}` : parsedMessage;
    }

    log = (...message: Array<any>) => {
        const parsedMessage = this.parseMessage(message, this.method()) ?? '';
        this.print('log', parsedMessage);
    }

    info = (...message: Array<any>) => {
        const parsedMessage = this.parseMessage(message, this.method());
        this.print('info', chalk.rgb(255,250,224)(parsedMessage));
    }

    warn = (...message: Array<any>) => {
        const parsedMessage = this.parseMessage(message, this.method());
        this.print('warn', chalk.yellow(parsedMessage));
    }

    error = (...message: Array<any>) => {
        const parsedMessage = this.parseMessage(message, this.method());
        this.print('error', chalk.redBright(parsedMessage));
    }

    success = (...message: Array<any>) => {
        const parsedMessage = this.parseMessage(message, this.method());
        this.print('info', chalk.greenBright(parsedMessage));
    }
}