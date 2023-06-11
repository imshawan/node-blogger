import './pre-start'; // Must be the first import

import EnvVars from '@src/constants/EnvVars';
import server from './server';
import {Logger} from '@src/utilities';

const {info} = new Logger();

// **** Run **** //

const SERVER_START_MSG = ('Express server started on port: ' + 
  EnvVars.Port.toString());

server.start(Number(EnvVars.Port), () => {
  // logger.info(SERVER_START_MSG);
  info(SERVER_START_MSG);
});
