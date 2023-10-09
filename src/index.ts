import './pre-start'; // Must be the first import

import EnvVars from '@src/constants/EnvVars';
import server from './server';
import {Logger, getArgv} from '@src/utilities';
import nconf from 'nconf';
import { Server } from 'http';
import { getIPv4Address } from './helpers';

const {info} = new Logger();

nconf.argv().env().file({ file: 'config.json' });
nconf.set('env', getArgv('env'))

// **** Run **** //

const PORT = Number(nconf.get('port'));
server.start(PORT, onListening);

function onListening(httpServer: Server) {
  const {app} = server;
  const addr = {port: app.get('port'), address: app.get('address')};
  const host = nconf.get('host') || 'http://localhost';
  const env = (nconf.get('env') || 'development').toLowerCase().trim();

  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : (addr.address ? addr.address : host) + (env === 'development' ? (':' + addr.port) : '') + '/';

  var IPv4Addr = ['http://', getIPv4Address(), ':',addr.port, '/'].join('');

  info('NodeBlogger running on ' + bind);
  info('On your local network ' + IPv4Addr)
}