import { Server } from 'http';
import path from 'path';
import fs from 'fs';
import server from "./server";
import { Logger, openWebUrl, _process } from "../src/utilities";
import '../src/helpers/logstream';

const logger = new Logger({prefix: 'setup'});
const configFileLocation = path.join(__dirname, '../config.json');

if (fs.existsSync(configFileLocation)) {
    logger.error('An existing configuration file was found for the application. Have you already setup the project?');
    process.exit(0);
}

server.start(3000, onListening);

function onListening(httpServer: Server) {
    const {app} = server;
    const port = app.get('port');
    const host = 'http://localhost';

    var bind = [host, port].join(':');

    logger.info('Web installer running on ' + bind);
    
    _process.writeToFile(process.pid);
    
    try {
        openWebUrl(bind);
    } catch (err) {
        logger.error('Error occured while launching browser');
    }
}