import { execSync } from 'child_process';
import fs from 'fs';
import { PROCESS_FILE, paths, NODE_ENV } from '@src/constants';
import { Logger } from './logger';

const logger = new Logger({prefix: 'process'});

const getCurrent = function() {
    const processId = fs.readFileSync(PROCESS_FILE).toString();

    return Number(processId);
}

const restart = function(processId?: number) {
    if (!processId) {
        processId = getCurrent();
    }
    const script = NODE_ENV == 'production' ? 'node cli.js' : 'ts-node cli.ts'
    const command = `${script} restart --pid ${processId} --env ${NODE_ENV}`;

    if (NODE_ENV === 'development') {
        logger.warn(`Restarting process in ${NODE_ENV} mode, the restart might not be appropriate.`);
    }
    
    execSync(command, {cwd: paths.execScripts});
}

const writeToFile = function (processId: number) {
    fs.writeFileSync(PROCESS_FILE, String(processId).trim());
}

export const _process = {
    getCurrent,
    restart,
    writeToFile
}