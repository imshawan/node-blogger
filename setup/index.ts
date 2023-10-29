import { Server } from 'http';
import server from "./server";
import { Logger } from "../src/utilities";

const logger = new Logger();

server.start(3000, onListening);

function onListening(httpServer: Server) {
  const {app} = server;
  const port = app.get('port');
  const host = 'http://localhost';

  var bind = [host, port].join(':');

  logger.info('Web installer running on ' + bind)
}