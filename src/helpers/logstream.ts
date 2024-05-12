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

import winston from 'winston';
import path from 'path';
import fs from 'fs'
import { paths } from '@src/constants';

const { format } = winston;
const { combine, timestamp, printf } = format;

const LOGS_DIRECTORY = path.join(paths.baseDir, 'logs');
const MAX_FILE_SIZE = 1 * 1024;
const LOG_FILE_NAME = 'logfile-{DATE}.log';

const logFormatter = printf(({ level, message, timestamp }) => {
    return message;
});

const getLogFilename = function (today: Date) {
    today = today ?? new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${today.getDate()}`;

    return LOG_FILE_NAME.replace(/\{DATE\}/g, dateString);
}

const initialize = function () {
    if (!fs.existsSync(LOGS_DIRECTORY)) {
        fs.mkdirSync(LOGS_DIRECTORY, {recursive: true});
    }

    const filename = getLogFilename(new Date());

    const logger = winston.createLogger({
		format: combine(timestamp(), logFormatter),
		transports: [
			new winston.transports.File({
				filename: path.join(LOGS_DIRECTORY, filename),
                zippedArchive: true,
                maxFiles: 10,
                maxsize: MAX_FILE_SIZE,
                tailable: true,
                level: 'info',
			}),
		],
	})

    logger.on('error', function(error) {
        console.error(error);
    });

    logger.info('\n');

    return logger;
}

export const stream = initialize();