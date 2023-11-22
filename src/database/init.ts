import {connect} from './connection';
import { initializeSessionStore } from './database';
import { Logger } from '@src/utilities';

const logger = new Logger();

export const mongo: {client?: any, connection?: any, sessionStore?: any} = {};

export const initializeDbConnection = async function (mongodb: any) {
    if (!Object.keys(mongodb).length) {
        throw new Error('Database configuration could not be loaded');
    }

    const {uri, db} = mongodb;
    if (!uri) {
        throw new Error('Database connection uri not found in the configuration');
    }

    if (!db) {
        throw new Error('Target database name is required for connection');
    }

    var dbCredentials = uri.match(/(?<=:\/\/)(.*)(?=@)/gi);
    if (!dbCredentials?.length || dbCredentials.length < 1) {
        logger.warn('username and password missing from the connection URI');
    }

    const {client, connection, dbName} = await connect(uri, {database: db}); 
    const sessionStore = await initializeSessionStore(uri, dbName);

    mongo.client = client;
    mongo.connection = connection;
    mongo.sessionStore = sessionStore;
}

export const closeConnection = async function (callback?: Function) {
    if (!callback) {
        callback = function (err: Error) {
            logger.error(err.message);
        }
    }

    if (!mongo.connection) {
        throw new Error('Cannot close connection as it does not exists');
    }

    try {
        mongo.connection.close();
    } catch (err) {
        callback(err);
    }
}