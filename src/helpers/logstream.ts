import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs'
import { paths } from '@src/constants';

const { format } = winston;
const { combine, timestamp, printf } = format;

const LOGS_DIRECTORY = path.join(paths.baseDir, 'logs');
const MAX_FILE_SIZE = 1 * 1024;
const LOG_FILE_NAME = 'logfile-%DATE%.log';

const logFormatter = printf(({ level, message, timestamp }) => {
    return message;
});

export const stream: {logger?: winston.Logger | null} = {}

export const initialize = function () {
    if (!fs.existsSync(LOGS_DIRECTORY)) {
        fs.mkdirSync(LOGS_DIRECTORY, {recursive: true});
    }

    const logger = winston.createLogger({
        format: combine(
            timestamp(),
            logFormatter
        ),
        transports: [
            new winston.transports.DailyRotateFile({
                filename: path.join(LOGS_DIRECTORY, LOG_FILE_NAME),
                maxSize: MAX_FILE_SIZE,
                datePattern: 'YYYY-MM-DD',
                maxFiles: 10, // number of files to keep, adjust as needed
                zippedArchive: true,
                level: 'info',
            })
        ]
    });

    logger.on('error', function(error) {
        console.error(error);
    });

    logger.info('\n\n\n');

    stream.logger = logger;
}