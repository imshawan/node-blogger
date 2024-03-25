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

export const stream: {logger?: winston.Logger | null} = {};

export const initialize = function () {
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

    stream.logger = logger;
}