import { Server } from 'http';
import path from 'path';
import fs from 'fs';
import server from "./server";
import { Logger } from "../src/utilities";

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
}