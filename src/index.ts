import './pre-start'; // Must be the first import

import EnvVars from '@src/constants/EnvVars';
import server from './server';
import {Logger} from '@src/utilities';
import nconf from 'nconf';
import { Server } from 'http';

const {info} = new Logger();

nconf.argv().env().file({ file: 'config.json' });

// **** Run **** //

server.start(Number(EnvVars.Port), onListening);


function onListening(httpServer: Server) {
  const {app} = server;
  const addr = {port: app.get('port'), address: app.get('address')};
  const host = nconf.get('host') || 'http://localhost';
  const env = (nconf.get('env') || 'development').toLowerCase().trim();

  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : (addr.address && addr.address.length > 2 ? addr.address : (host + (env === 'development' ? ':' : ''))) 
    + (env === 'development' ? addr.port : '');

  info('NodeBlogger running on ' + bind);
}