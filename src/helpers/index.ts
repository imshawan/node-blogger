export * from './routes';
export * from './response';
export * from './network';

export const validateConfiguration = function (configuration: any) {
    if (!Object.keys(configuration).length) {
      throw new Error('Configuration file is empty, cannot move ahead with it');
    }
  
    if (!configuration.hasOwnProperty('secret')) {
      throw new Error('Secret key is required to init sessions');
    }
  
    if (!configuration.hasOwnProperty('mongodb')) {
        throw new Error('Database configurations missing from the configuration');
    }

    const {mongodb} = configuration;
    if (!Object.keys(mongodb).length) {
        throw new Error('Mongodb configurations are empty');
    }

    if (!mongodb.hasOwnProperty('uri')) {
        throw new Error('Database connection URI missing from the configguration');
    }

    if (!mongodb.hasOwnProperty('db')) {
        throw new Error('Database name is missing from the configguration');
    }
  }